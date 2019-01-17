import React, { Component } from "react"
import axios from "axios"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

export default class CrawlerStatus extends Component {
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
        axios.get('/api/about/about')
            .then(response => {
                let about = response.data
                this.setState({ about, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })

        axios.get('/api/about/status')
            .then(response => {
                let status = response.data
                this.setState({ status, loading: false })
            })
            .catch(err => {
                this.setState({ loading: false, error: true })
            })
    }


    render() {
        if (this.state.loading) return 'Loading ...'
        if (!Object.keys(this.state.status).length) return 'No info'

        let active = <FontAwesomeIcon icon={faCheckCircle} color="green" />
        let deactive = <FontAwesomeIcon icon={faTimesCircle} color="red" />
        let LogoOrDomain = ({logo, domain}) => {
            if (logo) return <img src={logo} className="img-fluid" style={{width: 100}} title={domain} alt={domain} />
            return domain
        }

        let _table = []
        for (let index in this.state.status) {
            let domain = this.state.status[index]
            let row = (<tr key={domain.domain}>
              <th scope="row"><LogoOrDomain logo={domain.logo} domain={domain.domain} /></th>
              <td>{domain.time_check} phút</td>
              <td>{domain.active ? active : deactive}</td>
            </tr>)
            _table.push(row)
        }

        return (<table className="table">
                <thead>
                <tr>
                  <th scope="col">Dịch vụ</th>
                  <th scope="col">Thời gian cập nhật</th>
                  <th scope="col text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>{_table}</tbody>
        </table>)
    }
}