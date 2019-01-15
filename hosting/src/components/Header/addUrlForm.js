import React, { Component } from "react"
import { navigate } from "gatsby"
import axios from "axios"

import { withAuthentication } from '../Session'

const ERROR_MESSAGE = 'Lỗi, vui lòng thử lại sau'
const ERROR_MESSAGE_NOT_LOGIN = 'Vui lòng đăng nhập'

class AddUrlForm extends Component {
    state = { error: null, inputUrl: this.props.inputUrl }

    onChangeInput = (event) => {
        this.setState({ inputUrl: event.target.value })
        console.log(this.props)
    }

    onSubmit = (event) => {
        if (!this.props.authUser || !this.props.authUser.email) {
            return alert(ERROR_MESSAGE_NOT_LOGIN)
        }

        axios.get('/api/addUrl', { params: { url: this.state.inputUrl, email: this.props.authUser.email } })
            .then(response => {
                console.log(response)
                if (response.data) {
                    navigate(`/view/${response.data.id}`)
                }
            })
            .catch(err => {
                console.error(err)
                alert(err.msg || ERROR_MESSAGE)
            })

        event.preventDefault()
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <input className="form-control mr-sm-2" type="search" 
                       placeholder="URL e.g. tiki.vn, shopee.vn" 
                       onChange={this.onChangeInput}
                       type="url"
                       value={this.state.inputUrl}
                       aria-label="URL" />
            </form>
        )
    }
}

export default withAuthentication(AddUrlForm)