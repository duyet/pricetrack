import React, { PureComponent } from "react"
import axios from "axios"
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

import Layout from "../components/layout"
import ProductList from '../components/Block/ProductList'
import Loading from '../components/Block/Loading'
import { withAuthentication, AuthUserContext } from '../components/Session'

loadProgressBar()

const DEFAULT_NUMBER_ITEMS = 15
const HEAD_LINE_PRICE_TRACKER = 'Theo dõi giá'

class IndexComponent extends PureComponent {
    _mounted = true
    constructor(props) {
        super(props)
        this.state = {
            urls: [],
            loading: false,
            error: false,
            orderBy: 'created_at', // [created_at, last_pull_at, price_change]
            desc: 'true',
            currentMode: 'last_added',
            limit: DEFAULT_NUMBER_ITEMS,
            next: false,
            latest_params: {}
        }
    }

    SORT_TEXT = {
        'price_change': 'Giá mới thay đổi',
        'last_added': 'Mới thêm',
    }
    orderByModes = () => Object.keys(this.SORT_TEXT)

    setOtherBy(mode) {
        let currentMode = mode 
        let { orderBy, desc } = this.state

        if (mode === this.state.currentMode) {
            desc = desc === 'true' ? 'false' : 'true'
        }

        if (mode === 'price_change') {
            orderBy = 'price_change_at'
        } else if (mode === 'last_added') {
            orderBy = 'created_at'
        }

        this.setState({ currentMode, orderBy, desc }, () => this._loadData())
    }

    async componentDidMount() {
        this._mounted = true
        this._loadData()
    }

    async _fetchData(params) {
        console.log('context authUser',this.props.authUser)

        let response = await axios.get('/api/listUrls', { params })
        let { data, headers } = response
        let nextStartAt = headers.nextstartat || null
        params['startAt'] = nextStartAt

        return { urls: data, next: nextStartAt, params }
    }

    _setState(state) {
        if (this._mounted) this.setState(state)
    }

    async _loadData() {
        this.setState({ loading: true })

        let params = {
            orderBy: this.state.orderBy,
            desc: this.state.desc,
            limit: this.state.limit
        }

        try {
            let { urls, next } = await this._fetchData(params)
            this._setState({ urls, next, loading: false, latest_params: params })
        } catch(err) {
            console.error(err)
            this._setState({ loading: false, error: true })
        }
    }

    async onClickLoadMore(params) {
        try {
            let { urls, next } = await this._fetchData(params)
            let new_urls = [...this.state.urls, ...urls]
            this.setState({ urls: new_urls, next })
        } catch(err) {
            console.error(err)
            this.setState({ loading: false, error: true })
        }
    }

    renderListUrl() {
        if (this.state.loading) return <Loading />
        if (this.state.error) return 'Some thing went wrong'

        return <ProductList urls={this.state.urls}
                            loadMore={this.state.next} 
                            onClickLoadMore={
                                () => this.onClickLoadMore(this.state.latest_params)
                            } />
    }

    sortControl() {
        let controls = []
        for (let mode of this.orderByModes()) {
            let selected = this.state.currentMode === mode
            let sortIcon = null
            if (selected) {
                sortIcon = <span className="ml-2">
                    <FontAwesomeIcon icon={this.state.desc === 'true' ? faSortDown : faSortUp} />
                </span>
            }
            controls.push(
                <span className="text-white ml-2 btn" 
                    key={mode}
                    onClick={() => this.setOtherBy(mode)}
                    style={{ fontWeight: selected ? 700 : 300 }}>
                    {this.SORT_TEXT[mode]}
                    {sortIcon}
                </span>
            )
        }

        return controls
    }

    componentWillUnmount() {
        this._mounted = false
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

                    <div className="lh-100 mr-0 p-2 bd-highlight text-white justify-content-end">
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

const IndexWithContext = (props) => {
    return <AuthUserContext.Consumer>
        {authUser => <IndexComponent authUser={authUser} {...props} />}
    </AuthUserContext.Consumer>
}

export default withAuthentication(IndexWithContext)