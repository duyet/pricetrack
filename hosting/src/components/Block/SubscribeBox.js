import React, { Component } from "react"
import PropTypes from 'prop-types'
import axios from "axios"

const STATUS = 'Trạng thái'
const STATUS_ACTICE = 'Kích hoạt'
const NOTI_METHOD = 'Thông báo qua'
const NOTI_METHOD_MAP = [
    { type: 'email', text: 'Email' },
]
const NOTI_WHEN = 'Thông báo khi'
const NOTI_WHEN_MAP = [
    { type: 'down', text: 'Giá giảm' },
    { type: 'any', text: 'Giá tăng và giảm' },
    { type: 'available', text: 'Khi có hàng' },
]

class SubscribeBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            info: {},
            loading: false,
            error: false
        }
    }

    componentDidMount() {
        if (this.props.authUser) {
            this.setState({ loading: true })
            axios.get('/api/subscribe', {
                params: {
                    email: this.props.authUser.email,
                    url: this.props.url
                }
            })
                .then(response => {
                    let info = response.data
                    this.setState({ info, loading: false })
                })
                .catch(err => {
                    this.setState({ loading: false, error: true })
                })
        }
    }


    render() {
        if (this.state.loading) return 'Loading ...'
        if (!Object.keys(this.state.info).length) return 'You are not owner'

        return (
            <div className="row align-items-start bg-white mt-5 mb-5 ml-1 mr-1 p-3 rounded shadow-sm" 
                style={{fontSize: '0.8em'}}>
                <div className="col-auto mb-3">
                    <h6>{STATUS}</h6>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" 
                                    type="checkbox" id="checkActive" 
                                    value="true" checked={this.state.info.active} />
                            <label className="form-check-label" for="checkActive">{STATUS_ACTICE}</label>
                        </div>
                </div>
                <div className="col-auto mb-3">
                    <h6>{NOTI_WHEN}</h6>
                    {NOTI_WHEN_MAP.map(when => {
                        return (
                            <div className="form-check" key={when.type}>
                                <input className="form-check-input" type="radio" 
                                        name='notiWhen' id={when.type}
                                        value={when.type} 
                                        checked={when.type === this.state.info.expect_when} />
                                <label className="form-check-label" for={when.type}>
                                    {when.text}
                                </label>
                            </div>
                        )
                    })}
                </div>
                <div className="col-auto mb-3">
                    <h6>{NOTI_METHOD}</h6>
                    {NOTI_METHOD_MAP.map(when => {
                        return (
                            <div className="form-check" key={when.type}>
                                <input className="form-check-input" 
                                        type="checkbox" name='notiMethod' 
                                        id={when.type} value={when.type} 
                                        checked={when.type === this.state.info.methods} />
                                <label className="form-check-label" for={when.type}>
                                    {when.text} {this.state.info.email}
                                </label>
                            </div>
                        )
                    })}
                </div>
                <div className="col-auto"></div>
            </div>
        )
    }
}


SubscribeBox.propTypes = {
    url: PropTypes.string.isRequired,
    authUser: PropTypes.any.isRequired,
}
SubscribeBox.defaultProps = {}

export default SubscribeBox