import React, { Component } from "react"
import PropTypes from 'prop-types'
import axios from 'axios'
import Loading from './Loading'

const SUBSCRIBE_THIS_URL = 'Theo dõi sản phẩm này'
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
const CLICK_SYNC_DELAY = 100

class SubscribeBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            info: { active: false },
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

    handleChange(inputId, inputType = 'text') {
        return (e) => {
            let newInfoState = this.state.info || {}
            newInfoState[inputId] = inputType === 'checkbox' ? e.target.checked : e.target.value
            this.setState({ info: newInfoState }, () => {
                if (inputId === 'active') this.handleChangeActive()
                else this.syncSubscribe()
                console.log('Current state: ', this.state.info)
            })
        }
    }

    handleChangeActive() {
        // Default value for the first time active
        if (!this.state.info.active) {
            this.syncSubscribe()
            return
        }

        let stateInfo = this.state.info || {}
        if (!this.state.info.expect_when) stateInfo['expect_when'] = NOTI_WHEN_MAP[0].type
        if (!this.state.info.methods) stateInfo['methods'] = NOTI_METHOD_MAP[0].type
        if (!this.state.info.email) stateInfo['email'] = this.props.authUser.email || ''

        this.setState({ info: stateInfo }, this.syncSubscribe)
    }

    toggleActive(content) {
        return this.state.info && this.state.info.active 
                    ? content 
                    : null
    }

    syncSubscribe() {
        setTimeout(() => {
            if (this.props.authUser) {
                axios.post('/api/subscribe', 
                    this.state.info, 
                    {
                        params: {
                            email: this.props.authUser.email,
                            url: this.props.url
                        }
                    }
                )
                .then(response => {
                    this.setState({ loading: false })
                })
                .catch(err => {
                    console.error(err)
                    this.setState({ loading: false, error: true })
                })
            }
        }, CLICK_SYNC_DELAY)
    }

    render() {
        if (this.state.loading) return <Loading />
        // if (!Object.keys(this.state.info).length) return <SubscribeButton />

        return (
            <form className="row align-items-start bg-white mt-3 mb-3 ml-1 mr-1 p-3 rounded shadow-sm" 
                style={{fontSize: '0.8em'}}>
                <div className="col-auto mb-3">
                    <h6>{SUBSCRIBE_THIS_URL}</h6>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" 
                                    type="checkbox" id="checkActive" 
                                    value="true" checked={this.state.info.active}
                                    onChange={this.handleChange('active', 'checkbox')} />
                            <label className="form-check-label" htmlFor="checkActive">{STATUS_ACTICE}</label>
                        </div>
                </div>

                {this.toggleActive(
                    <div className='col-auto mb-3 '>
                        <h6>{NOTI_WHEN}</h6>
                        {NOTI_WHEN_MAP.map(when => {
                            return (
                                <div className="form-check" key={when.type}>
                                    <input className="form-check-input" type="radio" 
                                            name='notiWhen' id={when.type}
                                            value={when.type} 
                                            checked={when.type === this.state.info.expect_when}
                                            onChange={this.handleChange('expect_when')} />
                                    <label className="form-check-label" htmlFor={when.type}>
                                        {when.text}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                )}
                
                {this.toggleActive(
                    <div className="col-auto mb-3">
                        <h6>{NOTI_METHOD}</h6>
                        {NOTI_METHOD_MAP.map(when => {
                            return (
                                <div className="form-check" key={when.type}>
                                    <input className="form-check-input" 
                                            type="radio" name='notiMethod' 
                                            id={when.type} value={when.type} 
                                            checked={when.type === this.state.info.methods}
                                            onChange={this.handleChange('methods', 'radio')} />
                                    <label className="form-check-label" htmlFor={when.type}>
                                        {when.text} ({this.state.info.email})
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                )}

                {this.toggleActive(
                    <div className="col-auto"></div>
                )}
            </form>
        )
    }
}


SubscribeBox.propTypes = {
    url: PropTypes.string.isRequired,
    authUser: PropTypes.any.isRequired,
}
SubscribeBox.defaultProps = {}

export default SubscribeBox