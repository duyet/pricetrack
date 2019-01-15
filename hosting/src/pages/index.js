import React, { Component } from "react"
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHistory, faCaretDown, faCaretUp, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { Link } from "gatsby"
import axios from "axios"
import moment from "moment"
import 'moment/locale/vi'

import Layout from "../components/layout"
import { formatPrice, openDeepLink } from "../utils"
import { HeadColorBar } from '../components/Block'

library.add(faHistory, faCaretDown, faCaretUp, faShoppingCart)
loadProgressBar()

const ORDER_NOW = 'Mua ngay'
const VIEW_HISTORY = 'Lịch sử giá'
const HEAD_LINE_PRICE_TRACKER = 'Theo dõi giá'
const ADD_BY = 'Thêm bởi'
const LAST_PULL_AT = 'Cập nhật'

const SORT_TEXT = {
    'price_change': 'Giá mới thay đổi',
    'last_added': 'Mới thêm',
}

export default class IndexComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            urls: [],
            loading: false,
            error: false,
            
            orderBy: 'price_change', // created_at last_pull_at price_change
            desc: 'true',
            currentMode: 'price_change',
            limit: 25
        }
    }

    orderByModes = Object.keys(SORT_TEXT)

    setOtherBy(mode) {
        let currentMode = mode 

        if (mode == 'price_change') this.setState({ currentMode, orderBy: 'price_change', desc: 'true' })
        if (mode == 'last_added') this.setState({ currentMode, orderBy: 'created_at' })

        this._loadData()
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
        if (this.state.loading) return 'Loading ...'
        if (this.state.error) return 'Some thing went wrong'
        if (!this.state.urls.length) return 'Nothing'

        let dom = []
        for (let url of this.state.urls) {
            dom.push(
                <div className="media text-muted pt-3" key={url.url}>
                  
                  <HeadColorBar url={url} />
                  
                  <p className="media-body ml-3 pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong className="text-gray-dark">
                        <Link to={'/view/' + url.id}>
                          {url.info ? url.info.name : url.domain}
                        </Link>
                    </strong>
                    
                    <span className="ml-3">{formatPrice(url.latest_price)} </span>
                    {
                        url.price_change ? 
                            <span className="ml-2" style={{ fontWeight: 700, color: url.price_change < 0 ? '#28a745' : '#f44336' }}>
                                <FontAwesomeIcon icon={url.price_change < 0 ? 'caret-down' : 'caret-up' } /> 
                                {formatPrice(url.price_change, true)}
                            </span>
                            : ''
                    }

                    <br />
                    
                    <a href={url.url} onClick={e => { openDeepLink(url.url); e.preventDefault() }} style={{ color: '#797979 !important' }}>
                        {url.url.length > 100 ? url.url.slice(0, 100) + '...' : url.url}
                    </a>
                    <br />

                    <Link to={url.url} className='btn btn-primary btn-sm mt-2 mb-2 mr-1' 
                        onClick={e => { openDeepLink(url.url); e.preventDefault() }}>
                        <FontAwesomeIcon icon="shopping-cart" /> {ORDER_NOW}
                    </Link>
                    <Link className='btn btn-default btn-sm mt-2 mb-2 mr-1' to={'/view/' + url.id}>
                        <FontAwesomeIcon icon="history" /> {VIEW_HISTORY}
                    </Link>

                    <br />

                    <small>
                    <a href={'/view/' + url.id}>{ADD_BY} {url.add_by}</a> | &nbsp;
                    {moment(url.created_at).fromNow()} | &nbsp;
                    {LAST_PULL_AT}: {moment(url.last_pull_at).fromNow()}</small>
                  </p>
                </div>
            )
        }

        return dom
    }

    sortControl() {
        let controls = []
        for (let mode of this.orderByModes) {
            controls.push(
                <span className="text-white mr-2 btn" 
                    onClick={() => this.setOtherBy(mode)}
                    style={{ fontWeight: this.state.currentMode == mode ? 700 : 300 }}>
                    {SORT_TEXT[mode]}
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