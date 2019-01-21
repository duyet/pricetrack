import React, { Component } from "react"
import axios from "axios"

const NUM_URL_TEXT = 'Số link sản phẩm'
const NUM_CRONJOB_TEXT = 'Số lần cập nhật'

export default class Stats extends Component {
    constructor(props) {
        super(props)
        this.state = {
            statistics: {},

            loading: false,
            error: false
        }
    }

    componentDidMount() {
        this.setState({ loading: true })
        axios.get('/api/about')
            .then(response => {
                let { statistics } = response.data
                this.setState({ statistics, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }


    render() {
        if (this.state.loading) return 'Loading ...'
        if (!Object.keys(this.state.statistics).length) return 'No info'

        return (<table className="table table-bordered">
              <tbody>
                <tr>
                    <td style={{textAlign: 'right'}}>{NUM_URL_TEXT}</td>
                    <td>{this.state.statistics.url_count}</td>
                </tr>

                <tr>
                    <td style={{textAlign: 'right'}}>{NUM_CRONJOB_TEXT}</td>
                    <td>{this.state.statistics.num_url_cronjob_triggered}</td>
                </tr>
              </tbody>
        </table>)
    }
}