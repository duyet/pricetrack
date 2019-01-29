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

class ListProduct extends React.Component {
    render() {
        if (!this.props.urls.length) return EMPTY_STRING

        let dom = []
        for (let url of this.props.urls) {
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
                        <img className="ml-3 img-fluid" style={{height: 20}} src={url.domain_logo} alt="" />
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

        if (this.props.loadMore) {
            dom.push(
                <span className="btn btn-lg btn-block btn-outline-warning mt-5"
                    onClick={this.props.onClickLoadMore}
                    key="load-more-btn">
                    {LOAD_MORE}
                </span>
            )
        }

        return dom
    }
}

ListProduct.propTypes = {
    urls: PropTypes.array.isRequired
}
ListProduct.defaultProps = {
    loadMore: true
}

export default ListProduct