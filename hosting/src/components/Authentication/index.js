import React, { Component } from 'react';
import { navigate } from 'gatsby';

import * as ROUTES from '../../constants/routes';

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/account-exists-with-different-credential';
const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an E-Mail address to
  this social account already exists. Try to login from
  this account instead and associate your social accounts on
  your personal account page.
`;


export default class SignInGoogleBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = (event) => {
    this.props.firebase
      .doSignInWithGoogle()

      // Create a user in your Firebase Realtime Database too
      .then((socialAuthUser) => this.props.firebase.user(socialAuthUser.user.uid).set({
        username: socialAuthUser.user.displayName,
        email: socialAuthUser.user.email,
        roles: [],
      }))
      .then(() => {
        this.setState({ error: null });
        navigate(ROUTES.HOME);
      })
      .catch((error) => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <button type="submit">Sign In with Google</button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}
