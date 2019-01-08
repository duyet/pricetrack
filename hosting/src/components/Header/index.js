import React, { Component, Fragment } from "react"
import { Helmet } from "react-helmet"

import { Navbar, Nav, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import Menu from './menu'

import './header.css'
import noti from './notification.svg'

const LOGOUT_CONFIRM_TEXT = 'Are you sure?'

const NavigationAuth = ({ authUser, onClickSignIn, onClickLogout, onChangeInput, onSubmit }) => (
  <Fragment>
    <Helmet bodyAttributes={{
        class: 'bg-light'
    }}>
      <meta charSet="utf-8" />
      <title>Price Track</title>
    </Helmet>
    <header className="blog-header py-3">
      <div className="row flex-nowrap justify-content-between align-items-center">
        <div className="col-3 pt-1">
          <a className="text-muted" href="#">Price Track</a>
          {/*<a className="blog-header-logo text-dark" href="#">Price Track</a>*/}
        </div>
        <div className="col-6 text-center">
          <form onSubmit={onSubmit}>
            <input className="form-control mr-sm-2" type="search" 
                   placeholder="URL e.g. tiki.vn, shopee.vn" 
                   onChange={onChangeInput}
                   aria-label="URL" />
          </form>
        </div>
        <div className="col-3 d-flex justify-content-end align-items-center">
          <a className="text-muted" href="#">
            <img src={noti} style={{marginRight: 10}} />
          </a>

          {
            !authUser ? <a className="btn btn-sm btn-outline-secondary" onClick={onClickSignIn}>Sign in</a>
                     : <a className="btn btn-sm btn-outline-secondary" onClick={onClickLogout}>{authUser.displayName}</a>
          }
          
        </div>
      </div>
    </header>
    <Menu />
  </Fragment>
)


class NavBarBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null, inputUrl: '' };
  }

  onClickSignIn = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        console.log('socialAuthUser', socialAuthUser)
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  onClickLogout = event => {
    if (window.confirm(LOGOUT_CONFIRM_TEXT) == true) {
      this.props.firebase.doSignOut()
      window.location = ROUTES.HOME
    }
  }

  onChangeInput = event => {
     this.setState({inputUrl: event.target.value})
  }

  onSubmit = event => {
    alert(this.state.inputUrl)
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => <NavigationAuth authUser={authUser} 
                                     onClickSignIn={this.onClickSignIn}
                                     onClickLogout={this.onClickLogout}
                                     onChangeInput={this.onChangeInput}
                                     onSubmit={this.onSubmit} />}
      </AuthUserContext.Consumer>
    )
  }
}

const NavBar = withFirebase(NavBarBase);
export default NavBar; 