import React, { Component } from 'react';
import axios from 'axios';

import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { faExternalLinkAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import 'moment/locale/vi';

import { withAuthentication, AuthUserContext } from '../components/Session';
import Layout from '../components/layout';
import { formatPrice, openDeepLink } from '../utils';
import LogoPlaceHolder from '../components/Block/LogoPlaceHolder';
import Loading from '../components/Block/Loading';
import NotFound from '../components/Block/NotFound';
import SubscribeBox from '../components/Block/SubscribeBox';

const PRICE_TEXT = 'giá';
const GO_TO = 'Tới';
const CREATE_AT = 'Tạo';
const LAST_PULL_AT = 'Cập nhật giá';
const OUT_OF_STOCK = 'Hết hàng';

class ViewPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      data: {},
      history_data: [],
      loading: false,
      inputUrl: ''
    };
  }

  componentDidMount() {
    const url = this.props.location.pathname.replace('/view/', '');
    const idToken = localStorage.getItem('authUserIdToken');
    this.setState({ loading: true, inputUrl: url });

    axios.get('/api/getUrl', { params: { url, idToken } })
      .then((response) => {
        const { data } = response;
        this.setState({ data, loading: false, inputUrl: data.url });
        console.log(this.state.inputUrl, 'xxx');
      })
      .catch((err) => {
        console.log(err, 'not found');
        this.setState({ loading: false, error: true });
      });

    axios.get('/api/query', {
      params: {
        url,
        fields: 'price,datetime',
        limit: 100000
      }
    })
      .then((response) => {
        const { data } = response;
        this.setState({ history_data: data });
      })
      .catch((err) => {
        console.log(err, 'not found');
        this.setState({ loading: false, error: true });
      });
  }

    getData = () => {
      if (this.state.error === true) return {};

      return {
        title: {
          text: this.state.data.info && this.state.data.info.name
        },
        rangeSelector: {
          buttons: [{
            type: 'hour',
            count: 1,
            text: '1h'
          }, {
            type: 'hour',
            count: 12,
            text: '12h'
          }, {
            type: 'day',
            count: 1,
            text: '1D'
          }, {
            type: 'day',
            count: 7,
            text: '7D'
          }, {
            type: 'month',
            count: 1,
            text: '1M',
          }, {
            type: 'all',
            text: 'All'
          }]
        },
        series: [{
          name: PRICE_TEXT,
          type: 'area',
          data: this.state.history_data.map(
            (t) => [new Date(t.datetime).getTime(), t.price]
          ),
          tooltip: {
            valueDecimals: 0
          },
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
        }],
        plotOptions: {
          series: {
            softThreshold: true
          }
        },
        responsive: true,
        timezone: 'Asia/Ho_Chi_Minh'
      };
    }

    render() {
      if (this.state.error === true) {
        return <Layout><NotFound /></Layout>;
      }
      if (!this.state.data.url) {
        return <Layout><Loading /></Layout>;
      }


      const url = this.state.data;

      return (
            <Layout inputUrl={this.state.inputUrl}>

                <div className="pt-card my-3">
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex flex-row justify-content-between">
                            <LogoPlaceHolder url={url} width={80} height={80} />
                            <div className="ml-3">
                            { url.inventory_status === false
                              ? <span className="pt-badge pt-badge-danger mr-1">{OUT_OF_STOCK}</span>
                              : '' }
                                <a href={this.state.data.url}
                                    onClick={(e) => {
                                      openDeepLink(url.redirect);
                                      e.preventDefault();
                                    }}
                                    style={{ color: url.color }}>
                                    <h6 className="mb-0 lh-100">
                                        {this.state.data.info.name}
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2" style={{ fontWeight: 300, fontSize: 12 }} />
                                    </h6>
                                </a>
                                <br />
                                <small className="mb-3">
                                    <span className="pt-product-price-value">{formatPrice(this.state.data.latest_price,
                                      false, this.state.data.info.currency)}</span>
                                    <span className={`pt-product-price-change ${this.state.data.price_change < 0 ? 'pt-price-down' : 'pt-price-up'}`}>
                                        {
                                            this.state.data.price_change
                                              ? `(${formatPrice(this.state.data.price_change, true)})`
                                              : ''
                                        }
                                    </span>
                                </small>
                                <br />
                                <br />
                                <a href={url.url} className='pt-btn pt-btn-primary pt-btn-sm mr-1'
                                        onClick={(e) => {
                                          openDeepLink(url.redirect);
                                          e.preventDefault();
                                        }}>
                                        <FontAwesomeIcon icon={faShoppingCart} />
                                        {' '}{GO_TO} {url.domain}
                                </a>

                                <small className="ml-3 pt-product-meta">
                                    {url.deeplinkClick ? `${url.deeplinkClick} click${url.deeplinkClick > 1 ? 's' : ''} | ` : ''}
                                    {CREATE_AT} {moment(url.created_at).fromNow()} | &nbsp;
                                    {LAST_PULL_AT}: {url.last_pull_at && moment(url.last_pull_at).isValid() ? moment(url.last_pull_at).fromNow() : 'chưa cập nhật'}
                                </small>
                            </div>
                        </div>

                        <div className="my-3">
                            <a href={url.url}
                              onClick={(e) => {
                                openDeepLink(url.redirect);
                                e.preventDefault();
                              }}>
                                <img className="img-fluid" style={{ height: 40 }} src={url.domain_logo} alt="" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <HighchartsReact
                                highcharts={Highcharts}
                                constructorType={'stockChart'}
                                options={this.getData()}
                              />
                    </div>
                </div>

                <SubscribeBox
                  authUser={this.props.authUser}
                  url={this.state.inputUrl}
                  data={this.state.data} />
            </Layout>
      );
    }
}

const ViewPageComponent = (props) => <AuthUserContext.Consumer>
        {(authUser) => <ViewPage {...props} authUser={authUser} />}
    </AuthUserContext.Consumer>;

export default withAuthentication(ViewPageComponent);
