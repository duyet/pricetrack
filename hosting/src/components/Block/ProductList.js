import PropTypes from 'prop-types'
import React from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHistory, faCaretDown, faCaretUp, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import moment from "moment"
import 'moment/locale/vi'

import LogoPlaceHolder from './LogoPlaceHolder'
import { formatPrice, openDeepLink } from "../../utils"

const EMPTY_STRING = 'Không có'
const GO_TO = 'Tới'
const VIEW_HISTORY = 'Lịch sử giá'
const CREATE_AT = 'Tạo'
const ADD_BY = 'Thêm bởi'
const LAST_PULL_AT = 'Cập nhật giá'
const OUT_OF_STOCK = 'Hết hàng'
const LOAD_MORE = 'Tải thêm'

class ProductList extends React.Component {
    render() {
        if (!this.props.urls.length) return EMPTY_STRING

        let dom = []
        for (let url of this.props.urls) {
            dom.push(
                <div className="media text-muted pt-3 d-flex justify-content-between align-items-center flex-sm-row flex-column border-bottom border-gray" key={url.url}>
                  <div className="d-flex justify-content-center">
                    <div className="d-flex flex-column align-items-center">
                        <LogoPlaceHolder className="d-block" url={url} />
                        <a className="d-block d-sm-none mt-1" href={url.url} onClick={e => { openDeepLink(url.redirect); e.preventDefault() }}>
                            <img className="img-fluid" style={{width: 40}} src={url.domain_logo} alt="" />
                        </a>
                    </div>


                    <p className="media-body ml-3 pb-3 mb-0 small lh-125">
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

                        <a href={url.url} onClick={e => { openDeepLink(url.redirect); e.preventDefault() }} style={{ color: '#797979 !important' }}>
                            {url.url.length > 100 ? url.url.slice(0, 100) + '...' : url.url}
                        </a>
                        <br />

                        <a href={url.url} className='btn btn-primary btn-sm mt-2 mb-2 mr-1' 
                            onClick={e => { openDeepLink(url.redirect); e.preventDefault() }}>
                            <FontAwesomeIcon icon={faShoppingCart} /> {GO_TO} {url.domain}
                        </a>
                        <Link className='btn btn-default btn-sm mt-2 mb-2 mr-1' to={'/view/' + url.id}>
                            <FontAwesomeIcon icon={faHistory} /> {VIEW_HISTORY}
                        </Link>

                        <br />

                        <small>
                            <a href={'/view/' + url.id}>{ADD_BY} {url.add_by}</a> | &nbsp;
                            {CREATE_AT} {moment(url.created_at).fromNow()} | &nbsp;
                            {LAST_PULL_AT}: {moment(url.last_pull_at).fromNow()}
                        </small>
                    </p>
                  </div>
                  
                  <div className="mb-3 mr-3 d-none d-sm-block" style={{width: 100}}>
                    <Link to={url.url} onClick={e => { openDeepLink(url.redirect); e.preventDefault() }}>
                        <img className="ml-3 img-fluid" style={{width: 100}} src={url.domain_logo} alt="" />
                    </Link>
                  </div>
                </div>
            )
        }

        if (this.props.loadMore) {
            dom.push(
                <span className="btn btn-lg btn-block btn-warning mt-5"
                    onClick={this.props.onClickLoadMore}
                    key="load-more-btn">
                    {LOAD_MORE}
                </span>
            )
        }

        return dom
    }
}

ProductList.propTypes = {
    urls: PropTypes.array.isRequired
}
ProductList.defaultProps = {
    loadMore: true
}

export default ProductList