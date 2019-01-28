import React, { Component } from 'react'
import axios from 'axios'

import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { Link } from "gatsby"
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Layout from '../components/layout'
import { withAuthentication } from '../components/Session'
import { formatPrice, openDeepLink } from '../utils'
import LogoPlaceHolder from '../components/Block/LogoPlaceHolder'
import Loading from '../components/Block/Loading'

const PRICE_TEXT = 'giá'

class ViewPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            error: null,
            data: {},
            history_data: [],
            loading: false,
            inputUrl: ''
        }
    }

    componentDidMount() {
        let url = this.props.location.pathname.replace('/view/', '')
        this.setState({ loading: true })
        axios.get(`/api/getUrl?url=${url}`)
            .then(response => {
                let data = response.data
                this.setState({ data, loading: false, inputUrl: data.url })
                console.log(this.state.inputUrl, 'xxx')
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })

        axios.get(`/api/query?url=${url}&fields=price,datetime&limit=100000`)
            .then(response => {
                let data = response.data
                this.setState({ history_data: data })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }

    getData = () => {
        return {
            title: {
                text: this.state.data.info && this.state.data.info.name
            },
            series: [{
                name: PRICE_TEXT,
                type: 'area',
                data: this.state.history_data.map(
                    t => [new Date(t.datetime).getTime(), t.price]
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
            responsive: true
        }
    }

    render() {
        if (!this.state.data.url) {
            return <Layout><Loading /></Layout>
        }

        let url = this.state.data

        return (
            <Layout inputUrl={this.state.inputUrl}>
                
                <div className="d-flex align-items-center p-3 my-3 text-white-50 bg-purple rounded shadow-sm" 
                     style={{background: url.color}}>
                    <LogoPlaceHolder url={url} />
                    
                    <div className="lh-100 ml-3">
                        <Link to={this.state.data.url} onClick={e => { openDeepLink(url.deep_link); e.preventDefault() }}>
                            <h6 className="mb-0 text-white lh-100">
                                {this.state.data.info.name} 
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2" style={{fontWeight: 300, fontSize: 12}} />
                            </h6>
                        </Link>
                        <br />
                        <small style={{ color: '#fff' }}>
                            {formatPrice(this.state.data.latest_price)} 
                            <span style={{ fontWeight: 700, color: this.state.data.price_change < 0 ? '#0eff45' : '#fd4d16' }} className='ml-1'>
                                {
                                    this.state.data.price_change
                                    ? '(' + formatPrice(this.state.data.price_change, true) + ')'
                                    : ''
                                }
                            </span>
                        </small>
                    </div>

                    <div className="lh-100 my-3">
                        
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
            </Layout>
        )
    }
}

export default withAuthentication(ViewPage)