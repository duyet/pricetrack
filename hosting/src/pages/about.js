import React, { Component } from "react"
import axios from "axios"
import { Link } from "gatsby"

import Layout from "../components/layout"

export default class IndexComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: {},
            about: {},

            loading: false,
            error: false
        }
    }

    componentDidMount() {
        this.setState({ loading: true })
        axios.get('/api/about')
            .then(response => {
                let about = response.data
                this.setState({ about, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })

        axios.get('/api/status')
            .then(response => {
                let status = response.data
                this.setState({ status, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }

    render() {
        if (this.state.loading) return <Layout>Loading ...</Layout>
        // if (this.state.error) return <Layout>Some thing went wrong</Layout>
        
        return (
          <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{background: '#03A9F4'}}>
                    <div className="d-flex flex-grow-1 align-items-center">
                        <img className="mr-3" src="http://getbootstrap.com/docs/4.2/assets/brand/bootstrap-outline.svg" alt="" width="48" height="48" />
                        <div className="lh-100">
                          <h6 className="mb-0 text-white lh-100">Price track</h6>
                          <small>beta</small>
                        </div>
                    </div>
                </div>

                <div className="my-3 p-3 bg-white rounded shadow-sm">
                    PriceTrack là ứng dụng theo dõi giá trên các trang TMDT lớn như tiki.vn, shopee.vn, ... <br />
                    PriceTrack sẽ được một phần hoa hồng nhỏ khi bạn mua sản phẩm. <br /><br />
                    Liên hệ info[a]pricetrack.com
                </div>

          </Layout>
        )

    }
}