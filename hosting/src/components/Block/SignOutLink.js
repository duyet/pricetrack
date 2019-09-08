/* eslint-disable no-alert */
import React from 'react';
import { navigate } from 'gatsby';
import { withFirebase } from '../Firebase';

import { HOME } from '../../constants/routes';

const LOGOUT_CONFIRM_TEXT = 'Bạn có chắc?';
const LOGOUT_TEXT = 'Đăng xuất';

class SignOutLink extends React.Component {
  doLogout = (e) => {
    if (window.confirm(LOGOUT_CONFIRM_TEXT) === true) {
      this.props.firebase.doSignOut();
      navigate(HOME);
    }
    e.preventDefault();
  }

  render() {
    const style = { ...this.props.style, padding: 0 };
    return <button className='btn btn-link' style={style} onClick={this.doLogout}>{LOGOUT_TEXT}</button>;
  }
}

export default withFirebase(SignOutLink);