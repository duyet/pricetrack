import React, { Component } from "react"
import axios from "axios"

// Import React Table
import ReactTable from "react-table"
import "react-table/react-table.css"

// Modal
import Modal from 'react-awesome-modal'

import Layout from "../components/layout"
import { withAuthentication, AuthUserContext } from '../components/Session'
import HeadSlogan from "../components/Block/HeadSlogan";

const ERR_NOT_LOGIN = 'Vui lòng đăng nhập để sử dụng cashback'
const BTN_CREATE = 'Tạo link'
const ERROR_MESSAGE = 'Something went wrong'
const YOUR_CASHBACK_BALANCE = 'Số dư cashback'
const YOUR_CASHBACK_BALANCE_CHECKED_OUT = 'Đã thanh toán'
const UPDATING = 'Đang cập nhật'

const COL_TIME ='Thời gian'
const COL_ORDER_ID ='Mã đơn hàng'
const COL_STATUS ='Trạng thái'
const COL_BILLING ='Giá trị đơn hàng'
const COL_AMOUNT ='Giá trị'
const COL_CASHBACK_VALUE ='Cashback'
const COL_MERCHANT ='Website'
const COL_QUANTITY ='Số lượng'
const COL_PRODUCT_NAME ='Tên sản phẩm'

const TEXT_STATUS = {
    0: 'Chờ duyệt',
    1: 'Đã duyệt',
    2: 'Hủy',
}

class CashbackForm extends Component {
    state = { cashbackUrl: null, inputUrl: null }

    onSubmit = (e) => {
        e.preventDefault()

        const idToken = localStorage.getItem('authUserIdToken')

        const params = {
            idToken,
            url: this.state.inputUrl,
        }

        axios.post('/api/cashback', { ...params })
            .then(response => {
                console.log(response)
                if (response.data) {
                    let { cashbackUrl } = response.data
                    this.setState( { cashbackUrl } )
                }
            })
            .catch(err => {
                console.error(err)
                if (err.response) {
                    let data = err.response.data || {}
                    return alert(data.msg || ERROR_MESSAGE)
                }

                alert(err.msg || ERROR_MESSAGE)
            })

    }

    onChangeInput = (event) => {
        this.setState({ inputUrl: event.target.value })
    }

    render() {
        let cashbackUrlBox = this.state.cashbackUrl
            ?  <div className="input-group mb-3">
                    <input type="text" className="form-control" value={this.state.cashbackUrl} />
                    <div className="input-group-append">
                        <a href={this.state.cashbackUrl} target="_blank" rel="noopener noreferrer" className="input-group-text">Go</a>
                    </div>
                </div>
            : null

        return (
            <div>
                <form  onSubmit={this.onSubmit}>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" onChange={this.onChangeInput} />
                        <div className="input-group-append">
                            <button className="btn btn-outline-secondary">{BTN_CREATE}</button>
                        </div>
                    </div>

                    {cashbackUrlBox}
                </form>

            </div>
      )
    }
}

class SupportedProvider extends Component {
    state = { providers: {}, loading: false }

    componentDidMount() {
        this.setState({ loading: true })
        axios.get('/api/about')
            .then(response => {
                let { status } = response.data
                this.setState({ providers: status, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }

    render() {
        if (this.state.loading) return 'Loading ...'
        if (!Object.keys(this.state.providers).length) return null

        return (
            <div className="my-3 p-3 bg-white rounded shadow-sm text-center">
                {
                    Object.keys(this.state.providers).map(name => {
                        let provider = this.state.providers[name]
                        if (!provider.active) return null
                        return <img src={provider.logo} 
                                    key={provider.logo} 
                                    className="img-fluid mr-5" 
                                    alt=""
                                    style={{width: 100}} 
                                    title={provider.domain}  />
                    })
                }
            </div>
        )
    }
}

class CashbackBalance extends Component {
    state = {
        data: [],
        totalCommission: 0, 
        loading: false,
        modal: false,
        modalContent: null
    }

    componentDidMount() {
        const idToken = localStorage.getItem('authUserIdToken')

        this.setState({ loading: true })
        axios.get('/api/cashbackInfo', { params: { idToken } })
            .then(response => {
                let { data, totalCommission } = response.data
                this.setState({ data, totalCommission, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }

    _price() {
        if (this.state.loading) return '...'
        return `${this.state.totalCommission} VND`
    }

    _data() {
        if (!this.state.data) return null
        return this.state.data
    }

    showModal = (e, row) => {
        e.preventDefault()
        this.setState({ modal: true, modalContent: row._original })
    }

    _getModalContent() {
        if (!this.state.modalContent) return null
        return (
            <ReactTable
                    data={this.state.modalContent.products}
                    columns={[
                        { Header: COL_TIME, accessor: "click_time" },
                        { Header: COL_PRODUCT_NAME, id: "product_name",
                            Cell: ({ row }) => (
                                <span className="btn btn-link">{row._original.product_id}</span>
                            )
                        },
                        { Header: COL_STATUS, id: "status", 
                            accessor: d => <>
                                <span className={
                                    [
                                        "badge",
                                        "mr-1",
                                        d.status === 0 ? 'badge-warning' : '',
                                        d.status === 1 ? 'badge-success' : '',
                                        d.status === 2 ? 'badge-danger' : '',
                                    ].join(' ')
                                }>
                                    { TEXT_STATUS[d.status] }
                                </span>
                            </>
                        },
                        { Header: COL_QUANTITY, accessor: "product_quantity" },
                        { Header: COL_AMOUNT, accessor: "amount" }
                    ]}
                    defaultPageSize={10}
                    minRows={2}
                    className="-striped -highlight bg-white shadow-sm text-center size-sm"
                />
        )
    }

    render() {
        if (this.state.loading) return 'Loading ...'

        return (
            <>
                <div className="d-flex justify-content-center my-3 p-3 bg-white rounded shadow-sm text-center">
                    <div className="mr-5">
                        <span>{YOUR_CASHBACK_BALANCE}: </span>
                        <span style={{color: '#1791d3', fontWeight: 700}}>{this._price()}</span>
                        <div>
                            <small><em>({UPDATING})</em></small>
                        </div>
                    </div>
                    
                    <div>
                        <span>{YOUR_CASHBACK_BALANCE_CHECKED_OUT}: </span>
                        <span style={{color: '#1791d3', fontWeight: 700}}>0 VND</span>
                        <div>
                            <small><em></em></small>
                        </div>
                    </div>
                </div>

                <ReactTable
                    data={this._data()}
                    columns={[
                        { Header: COL_TIME, accessor: "click_time" },
                        { Header: COL_ORDER_ID, id: "order_id",
                            Cell: ({ row }) => (
                                <button className="btn btn-link" onClick={e => this.showModal(e, row)}>
                                    {row._original.order_id}
                                </button>
                            )
                        },
                        { Header: COL_STATUS, id: "status", 
                            accessor: d => <>
                                <span className="badge badge-warning mr-1">{d.order_pending}</span>
                                <span className="badge badge-success mr-1">{d.order_success}</span>
                                <span className="badge badge-danger mr-1">{d.order_reject}</span>
                            </>
                        },
                        { Header: COL_BILLING, accessor: "billing" },
                        { Header: COL_CASHBACK_VALUE, accessor: "pub_commission" },
                        { Header: COL_MERCHANT, accessor: "merchant" },
                    ]}
                    defaultPageSize={10}
                    className="-striped -highlight bg-white shadow-sm text-center size-sm"
                />
                <Modal 
                    visible={this.state.modal}
                    effect="fadeInUp"
                    onClickAway={() => this.setState({ modal: false })}
                >
                    <div>
                        {this._getModalContent()}
                    </div>
                </Modal>
            </>
        )
    }
}

class IndexComponent extends Component {
    render() {
        return (
          <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{background: '#03A9F4'}}>
                    <HeadSlogan icon="checkmark" sub_headline="cashback" />
                </div>

                <div className="my-3 p-3 bg-white rounded shadow-sm row">
                    <div className="col mb-3" style={{ fontSize: 13 }}>
                        Cashback là chức năng nhận lại tiền hoàn trả từ Pricetrack. 
                        Lưu ý:
                        <ul>
                            <li>Bạn phải click vào link mua hàng của bạn rồi tiến hành mua ngay mới được tính Hoa hồng.</li>
                            <li>Rút tiền Hoa hồng: do chính sách chung nên sau 45 ngày và số tiền Hoa hồng đạt tối thiểu 100,000đ thì pricetrack sẽ chuyển khoản lại cho các bạn.</li>
                        </ul>
                    </div>
                    <div className="col mb-3">
                        { !this.props.authUser ? <div className="text-danger text-sm">{ERR_NOT_LOGIN}</div> : <CashbackForm {...this.props} /> }
                    </div>
                </div>

                <CashbackBalance />
                <SupportedProvider />

          </Layout>
        )
    }
}

const IndexWithContext = (props) => {
    return <AuthUserContext.Consumer>
        {authUser => <IndexComponent authUser={authUser} {...props} />}
    </AuthUserContext.Consumer>
}

export default withAuthentication(IndexWithContext)