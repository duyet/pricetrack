import React, { Component } from 'react'
import axios from 'axios'

import Layout from '../components/layout'
import { withAuthentication } from '../components/Session'

import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'

const CHART_TITLE = 'Price Chart'

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
                name: 'Giá',
                data: this.state.history_data.map(
                    t => [new Date(t.datetime).getTime(), t.price]
                )
            }],
            responsive: true
        }
    }

    formatPrice(price, plus_sign=false) {
        var sign = price > 0 ? '+' : ''
        return (plus_sign ? sign : '') + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    render() {
        if (!this.state.data.url) {
            return (
                <Layout>Loading ...</Layout>
            )
        }

        return (
            <Layout inputUrl={this.state.inputUrl}>
                
                <div className="d-flex align-items-center p-3 my-3 text-white-50 bg-purple rounded shadow-sm">
                    <div className="lh-100">
                        <a href={this.state.data.url}>
                            <h6 className="mb-0 text-white lh-100">{this.state.data.info.name}</h6>
                        </a>
                        <br />
                        <small style={{ color: '#fff' }}>
                            {this.formatPrice(this.state.data.latest_price)} VND 
                            <span style={{ fontWeight: 700, color: this.state.data.price_change < 0 ? '#0eff45' : '#fd4d16' }} className='ml-1'>
                                ({this.formatPrice(this.state.data.price_change, true)} VND)
                            </span>
                        </small>
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