import React, { Component, Fragment } from "react"
import { Helmet } from "react-helmet"
import { navigate } from "gatsby"

import { withFirebase } from '../Firebase'
import { AuthUserContext } from '../Session'
import * as ROUTES from '../../constants/routes'
import Menu from './menu'
import AddUrlForm from './addUrlForm'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

import './header.css'
import noti from './notification.svg'

const LOGOUT_CONFIRM_TEXT = 'Bạn có chắc?'
const SIGN_IN = 'Đăng nhập'
const LOGOUT = 'Thoát'

const NavigationAuth = ({ authUser, onClickSignIn, onClickLogout, inputUrl }) => (
  <Fragment>
    <Helmet bodyAttributes={{
        class: 'bg-light'
    }}>
      <meta charSet="utf-8" />
      <title>Price Track</title>
    </Helmet>
    <header className="blog-header py-3">
      <div className="row flex-nowrap justify-content-between align-items-center">
        <div className="col">
          <a className="text-muted" href="/">Price Track</a>
        </div>
        <div className="col text-center">
          <AddUrlForm authUser={authUser} inputUrl={inputUrl} />
        </div>
        <div className="col d-flex justify-content-end align-items-center">
          <a className="text-muted" href="/">
            <img src={noti} style={{marginRight: 10}} alt="" />
          </a>

          {
            !authUser ? <button className="btn btn-sm btn-outline-secondary" onClick={onClickSignIn}>
                          {SIGN_IN} <FontAwesomeIcon icon={faGoogle} size="xs" /> 
                        </button>
                     : <button className="btn btn-sm btn-outline-secondary" onClick={onClickLogout} title={LOGOUT}>
                          {authUser.displayName}
                       </button>
          }
          
        </div>
      </div>
    </header>
    <Menu authUser={authUser} />
  </Fragment>
)


class NavBarBase extends Component {
  state = { error: null, inputUrl: this.props.inputUrl }

  onClickSignIn = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        console.log('socialAuthUser', socialAuthUser)
        this.setState({ error: null })
        navigate(ROUTES.HOME)
      })
      .catch(error => {
        this.setState({ error })
      });

    event.preventDefault()
  }

  onClickLogout = event => {
    if (window.confirm(LOGOUT_CONFIRM_TEXT) === true) {
      this.props.firebase.doSignOut()
      window.location = ROUTES.HOME
    }
  }

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => <NavigationAuth authUser={authUser} 
                                     onClickSignIn={this.onClickSignIn}
                                     onClickLogout={this.onClickLogout}
                                     onChangeInput={this.onChangeInput}
                                     onSubmit={this.onSubmit}
                                     inputUrl={this.state.inputUrl} />}
      </AuthUserContext.Consumer>
    )
  }
}

const NavBar = withFirebase(NavBarBase)
export default NavBar