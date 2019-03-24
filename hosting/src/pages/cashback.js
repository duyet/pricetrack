import React, { Component } from "react"
import axios from "axios"

import Layout from "../components/layout"
import { withAuthentication, AuthUserContext } from '../components/Session'

const ERR_NOT_LOGIN = 'Vui lòng đăng nhập để sử dụng cashback'
const BTN_CREATE = 'Tạo link'
const ERROR_MESSAGE = 'Something went wrong'

class CashbackForm extends Component {
    state = { cashbackUrl: null, inputUrl: null }

    onSubmit = (e) => {
        e.preventDefault()

        const idToken = localStorage.getItem('authUserIdToken')

        const params = {
            idToken,
            url: this.state.inputUrl,
        }

        axios.get('/api/cashback', { params })
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
        return (
            <div>
                <form className="form-inline" onSubmit={this.onSubmit}>
                    <div className="form-group mb-2">
                        <label for="staticEmail2" className="sr-only">Email</label>
                        <input type="text" className="form-control" onChange={this.onChangeInput} />
                    </div>
                    <button type="submit" className="btn btn-primary mb-2 ml-2">{BTN_CREATE}</button>
                </form>

                { this.state.cashbackUrl ? <a href={this.state.cashbackUrl} target="_blank">{this.state.cashbackUrl}</a> : null }
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
                                    className="img-fluid mr-5" 
                                    style={{width: 100}} 
                                    title={provider.domain}  />
                    })
                }
            </div>
        )
    }
}


class IndexComponent extends Component {
    render() {
        return (
          <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{background: '#03A9F4'}}>
                    <div className="d-flex flex-grow-1 align-items-center">
                        <img className="mr-3" src="http://getbootstrap.com/docs/4.2/assets/brand/bootstrap-outline.svg" alt="" width="48" height="48" />
                        <div className="lh-100">
                          <h6 className="mb-0 text-white lh-100">Cashback</h6>
                          <small>beta</small>
                        </div>
                    </div>
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