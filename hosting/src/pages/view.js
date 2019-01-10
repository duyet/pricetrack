import React, { Component } from 'react';
import axios from 'axios'

import Layout from '../components/layout';
import { withAuthentication } from '../components/Session'

class ViewPage extends Component {
    constructor(props) {
        super(props)

        this.state = { error: null, data: {}, loading: false, inputUrl: '' }
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
    }

    render() {
        return (
            <Layout inputUrl={this.state.inputUrl}>
                <div className="row">
                    <div className="col align-items-center">
                        {JSON.stringify(this.state.inputUrl)}
                    </div>
                </div>
            </Layout>
        )
    }
}

export default withAuthentication(ViewPage)