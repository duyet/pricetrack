/* eslint-disable no-alert */
import React, { Component } from 'react';
import axios from 'axios';

import { withAuthentication } from '../Session';

const ERROR_MESSAGE = 'Lỗi, vui lòng thử lại sau';
const ERROR_MESSAGE_NOT_LOGIN = 'Vui lòng đăng nhập để thêm URL này';

// TODO: bug in navigate's gastby
const navigate = (url) => {
  window.location = url;
  return true;
};

class AddUrlForm extends Component {
    state = { error: null, inputUrl: this.props.inputUrl || '' }

    onChangeInput = (event) => {
      this.setState({ inputUrl: event.target.value });
    }

    onSubmit = (event) => {
      const idToken = localStorage.getItem('authUserIdToken');

      if (!this.props.authUser || !this.props.authUser.email || !idToken) {
        alert(ERROR_MESSAGE_NOT_LOGIN);
        navigate(`/view/${encodeURIComponent(this.state.inputUrl)}`);
      }

      const params = {
        idToken,
        url: this.state.inputUrl,
        email: this.props.authUser.email
      };
      axios.get('/api/addUrl', { params })
        .then((response) => {
          console.log(response);
          if (response.data) {
            navigate(`/view/${response.data.id}`);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.response) {
            const data = err.response.data || {};
            return alert(data.msg || ERROR_MESSAGE);
          }

          return alert(err.msg || ERROR_MESSAGE);
        });

      event.preventDefault();
    }

    render() {
      return (
            <form onSubmit={this.onSubmit}>
                <input className="form-control mr-sm-2" type="search"
                       placeholder="URL e.g. tiki.vn, shopee.vn"
                       onChange={this.onChangeInput}
                       value={this.state.inputUrl}
                       aria-label="URL" />
            </form>
      );
    }
}

export default withAuthentication(AddUrlForm);