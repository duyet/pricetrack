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


    render() {
        return (
            <Layout inputUrl={this.state.inputUrl}>
                <div className="row">
                    <div className="col mb-5">
                        Tên sản phẩm: <a href={this.state.data.url}>{this.state.data.info ? this.state.data.info.name : ''}</a>
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