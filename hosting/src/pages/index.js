import React, { Component } from "react"
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHistory, faCaretDown, faCaretUp, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { Link } from "gatsby"
import axios from "axios"
import moment from "moment"
import 'moment/locale/vi'

import Layout from "../components/layout"
import { formatPrice, openDeepLink } from "../utils"
import LogoPlaceHolder from '../components/Block/LogoPlaceHolder'
import Loading from '../components/Block/Loading'

import { withAuthentication } from '../components/Session'

loadProgressBar()

const GO_TO = 'Tới'
const VIEW_HISTORY = 'Lịch sử giá'
const HEAD_LINE_PRICE_TRACKER = 'Theo dõi giá'
const CREATE_AT = 'Tạo'
const ADD_BY = 'Thêm bởi'
const LAST_PULL_AT = 'Cập nhật giá'
const OUT_OF_STOCK = 'Hết hàng'

class IndexComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            urls: [],
            loading: false,
            error: false,
            
            orderBy: 'created_at', // created_at last_pull_at price_change
            desc: 'true',
            add_by: '',
            currentMode: 'last_added',
            limit: 25
        }
    }

    SORT_TEXT = {
        'price_change': 'Giá mới thay đổi',
        'last_added': 'Mới thêm',
    }
    orderByModes = () => Object.keys(this.SORT_TEXT)

    setOtherBy(mode) {
        let currentMode = mode 
        let { orderBy, desc, add_by } = this.state.orderBy

        if (mode === 'price_change') {
            orderBy = 'price_change_at'
            desc = 'true'
        } else if (mode === 'last_added') {
            orderBy = 'created_at'
            desc = 'true'
        } else if (mode === 'my_product') {
            add_by = ''
        }

        this.setState({ currentMode, orderBy, desc }, () => this._loadData())
    }

    componentDidMount() {
        this._loadData()
    }

    _loadData() {
        this.setState({ loading: true })

        let params = {
            helpers: 1,
            orderBy: this.state.orderBy,
            desc: this.state.desc,
            limit: this.state.limit,
        }
        axios.get('/api/listUrls', { params })
            .then(response => {
                let urls = response.data
                this.setState({ urls, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }

    renderListUrl() {
        if (this.state.loading) return <Loading />
        if (this.state.error) return 'Some thing went wrong'
        if (!this.state.urls.length) return 'Nothing'

        let dom = []
        for (let url of this.state.urls) {
            dom.push(
                <div className="media text-muted pt-3" key={url.url}>
                  
                  <LogoPlaceHolder url={url} />
                  
                  <p className="media-body ml-3 pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong className="text-gray-dark">
                        { url.inventory_status === false 
                            ? <span className="badge badge-danger mr-1" style={{fontSize: '1em', fontWeight: 300}}>{OUT_OF_STOCK}</span>
                            : '' }

                        <Link to={'/view/' + url.id}>
                          {url.info ? url.info.name : url.domain}
                        </Link>
                    </strong>
                    
                    <span className="ml-3">{formatPrice(url.latest_price, false, url.info.currency)} </span>
                    {
                        url.price_change ? 
                            <span className="ml-2" style={{ fontWeight: 700, color: url.price_change < 0 ? '#28a745' : '#f44336' }}>
                                <FontAwesomeIcon icon={url.price_change < 0 ? faCaretDown : faCaretUp } /> 
                                {formatPrice(url.price_change, true, url.info.currency)}
                            </span>
                            : ''
                    }

                    <br />
                    
                    <a href={url.url} onClick={e => { openDeepLink(url.deep_link); e.preventDefault() }} style={{ color: '#797979 !important' }}>
                        {url.url.length > 100 ? url.url.slice(0, 100) + '...' : url.url}
                    </a>
                    <br />

                    <Link to={url.url} className='btn btn-primary btn-sm mt-2 mb-2 mr-1' 
                        onClick={e => { openDeepLink(url.deep_link); e.preventDefault() }}>
                        <FontAwesomeIcon icon={faShoppingCart} /> {GO_TO} {url.domain}
                    </Link>
                    <Link className='btn btn-default btn-sm mt-2 mb-2 mr-1' to={'/view/' + url.id}>
                        <FontAwesomeIcon icon={faHistory} /> {VIEW_HISTORY}
                    </Link>

                    <Link to={url.url} onClick={e => { openDeepLink(url.deep_link); e.preventDefault() }}>
                        <img class="ml-3 img-fluid" style={{height: 20}} src={url.domain_logo} alt="" />
                    </Link>

                    <br />

                    <small>
                        <a href={'/view/' + url.id}>{ADD_BY} {url.add_by}</a> | &nbsp;
                        {CREATE_AT} {moment(url.created_at).fromNow()} | &nbsp;
                        {LAST_PULL_AT}: {moment(url.last_pull_at).fromNow()}
                    </small>
                  </p>
                </div>
            )
        }

        return dom
    }

    sortControl() {
        let controls = []
        for (let mode of this.orderByModes()) {
            controls.push(
                <span className="text-white mr-2 btn" 
                    key={mode}
                    onClick={() => this.setOtherBy(mode)}
                    style={{ fontWeight: this.state.currentMode === mode ? 700 : 300 }}>
                    {this.SORT_TEXT[mode]}
                </span>
            )
        }

        return controls
    }

    render() {
        return (
            <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{background: '#03A9F4'}}>
                    <div className="d-flex flex-grow-1 align-items-center">
                        <img className="mr-3" src="http://getbootstrap.com/docs/4.2/assets/brand/bootstrap-outline.svg" alt="" width="48" height="48" />
                        <div className="lh-100">
                          <h6 className="mb-0 text-white lh-100">{HEAD_LINE_PRICE_TRACKER}</h6>
                          <small>beta</small>
                        </div>
                    </div>

                    <div className="lh-100 mr-0 p-2 bd-highlight text-white">
                        {this.sortControl()}
                   </div>
                </div>

                <div className="my-3 p-3 bg-white rounded shadow-sm" id="listUrls">
                    {this.renderListUrl()}
                </div>
            </Layout>
        )
    }
}

export default withAuthentication(IndexComponent)