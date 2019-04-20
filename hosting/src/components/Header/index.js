import React, { Component, Fragment } from "react"
import { Helmet } from "react-helmet"
import { navigate } from "gatsby"

import { withFirebase } from '../Firebase'
import { AuthUserContext } from '../Session'
import * as ROUTES from '../../constants/routes'
import Menu from './menu'
import AddUrlForm from './addUrlForm'
import Logo from './Logo'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

import './header.css'
import notiIcon from './notification.svg'
import profileIcon from './profile.svg'

const SIGN_IN = 'Đăng nhập'

const UserButton = ({authUser, onClickSignIn, onClickProfile}) => {
  const className = 'btn btn-sm btn-outline-secondary ml-2'
  if (!authUser) return (
    <button className={className} onClick={onClickSignIn}>
      {SIGN_IN} <FontAwesomeIcon icon={faGoogle} /> 
    </button>
  )

  return (
    <Fragment>
      <button className={className + ' d-none d-sm-block'} onClick={onClickProfile}>
          {authUser.displayName}
      </button>
      <button className='btn btn-link text-muted d-block d-sm-none' onClick={onClickProfile}>
        <img src={profileIcon} style={{width: 20}} alt="" />
      </button>
    </Fragment>
  )
}

const NavigationAuth = ({ authUser, onClickSignIn, onClickProfile, inputUrl, firebase }) => (
  <Fragment>
    <Helmet bodyAttributes={{
        class: 'bg-light'
    }}>
      <meta charSet="utf-8" />
      <title>Price Track</title>
    </Helmet>
    <header className="blog-header py-3">
      <div className="row flex-nowrap justify-content-between align-items-center">
        <div className="col-auto">
          <Logo />
        </div>
        <div className="col">
          <AddUrlForm authUser={authUser} inputUrl={inputUrl} firebase={firebase} />
        </div>
        <div className="col-auto">
          <div className="d-flex justify-content-end align-items-center">
            <a className="text-muted" href="/" >
              <img src={notiIcon} alt="" />
            </a>

            <UserButton authUser={authUser} onClickProfile={onClickProfile} onClickSignIn={onClickSignIn} />
          </div>
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
        console.error(error)
        this.setState({ error })
      });

    event.preventDefault()
  }

  onClickProfile = () => navigate(ROUTES.PROFILE)

  render() {
    return (
      <AuthUserContext.Consumer>
        {authUser => <NavigationAuth authUser={authUser} 
                                     onClickSignIn={this.onClickSignIn}
                                     onClickProfile={this.onClickProfile}
                                     onChangeInput={this.onChangeInput}
                                     onSubmit={this.onSubmit}
                                     inputUrl={this.state.inputUrl}
                                     firebase={this.props.firebase} />}
      </AuthUserContext.Consumer>
    )
  }
}

const NavBar = withFirebase(NavBarBase)
export default NavBar