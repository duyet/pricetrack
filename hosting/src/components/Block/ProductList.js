import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'gatsby';
import { OutboundLink as A } from 'gatsby-plugin-google-gtag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHistory, faCaretDown, faCaretUp, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment/locale/vi';

import LogoPlaceHolder from './LogoPlaceHolder';
import { formatPrice, openDeepLink } from '../../utils';

const EMPTY_STRING = 'Không có';
const GO_TO = 'Tới';
const VIEW_HISTORY = 'Lịch sử giá';
const CREATE_AT = 'Tạo';
const ADD_BY = 'Thêm bởi';
const LAST_PULL_AT = 'Cập nhật giá';
const OUT_OF_STOCK = 'Hết hàng';
const LOAD_MORE = 'Tải thêm';

class ProductList extends React.Component {
  render() {
    if (!this.props.urls.length) return EMPTY_STRING;

    const dom = this.props.urls.map((url) => (
        <div className="pt-product-item" key={url.url}>
          <div className="d-flex flex-column align-items-center">
              <LogoPlaceHolder className="pt-product-logo" url={url} />
              <A className="d-block d-sm-none mt-1" href={url.url} onClick={(e) => { openDeepLink(url.redirect); e.preventDefault(); }}>
                  <img className="img-fluid" style={{ width: 40 }} src={url.domain_logo} alt="" />
              </A>
          </div>

          <div className="pt-product-body">
              <div className="pt-product-title">
                  { url.inventory_status === false
                    ? <span className="pt-badge pt-badge-danger mr-1">{OUT_OF_STOCK}</span>
                    : '' }

                  <Link to={`/view/${url.id}`}>
                  {url.info ? url.info.name : url.domain}
                  </Link>
              </div>

              <span className="pt-product-price-value">{formatPrice(url.latest_price, false, url.info.currency)} </span>
              {
                  url.price_change
                    ? <span className={`pt-product-price-change ${url.price_change < 0 ? 'pt-price-down' : 'pt-price-up'}`}>
                          <FontAwesomeIcon
                            icon={url.price_change < 0 ? faCaretDown : faCaretUp } />
                          {formatPrice(url.price_change, true, url.info.currency)}
                      </span>
                    : ''
              }

              <br />

              <A href={url.url} onClick={(e) => { openDeepLink(url.redirect); e.preventDefault(); }} style={{ color: '#797979 !important' }}>
                  {url.url.length > 100 ? `${url.url.slice(0, 100)}...` : url.url}
              </A>
              <br />

              <div className="pt-product-actions mt-2 mb-2">
                <A href={url.url} className='pt-btn pt-btn-primary pt-btn-sm'
                    onClick={(e) => { openDeepLink(url.redirect); e.preventDefault(); }}>
                    <FontAwesomeIcon icon={faShoppingCart} /> {GO_TO} {url.domain}
                </A>
                <Link className='pt-btn pt-btn-secondary pt-btn-sm' to={`/view/${url.id}`}>
                    <FontAwesomeIcon icon={faHistory} /> {VIEW_HISTORY}
                </Link>
              </div>

              <br />

              <small className="pt-product-meta">
                  <A href={`/view/${url.id}`}>{ADD_BY} {url.add_by}</A> | &nbsp;
                  {url.deeplinkClick ? `${url.deeplinkClick} click${url.deeplinkClick > 1 ? 's' : ''} | ` : ''}
                  {CREATE_AT} {moment(url.created_at).fromNow()} | &nbsp;
                  {LAST_PULL_AT}: {moment(url.last_pull_at).fromNow()}
              </small>
          </div>

          <div className="d-none d-sm-block" style={{ width: 100 }}>
            <Link to={url.url} onClick={(e) => { openDeepLink(url.redirect); e.preventDefault(); }}>
                <img className="img-fluid" style={{ width: 100 }} src={url.domain_logo} alt="" />
            </Link>
          </div>
        </div>
    ));

    if (this.props.loadMore) {
      dom.push(
        <span className="pt-btn pt-btn-primary mt-5"
            onClick={this.props.onClickLoadMore}
            key="load-more-btn">
            {LOAD_MORE}
        </span>
      );
    }

    return dom;
  }
}

ProductList.propTypes = {
  urls: PropTypes.array.isRequired
};
ProductList.defaultProps = {
  loadMore: true
};

export default ProductList;