import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { navigate } from 'gatsby';
import { OutboundLink as A } from 'gatsby-plugin-google-gtag';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import Menu from './menu';
import AddUrlForm from './addUrlForm';
import Logo from './Logo';


import './header.css';
import notiIcon from './notification.svg';
import profileIcon from './profile.svg';

const SIGN_IN = 'Đăng nhập';
const TITLE = 'Theo dõi giá và hoàn tiền | Price tracker & Cashback';

const UserButton = ({ authUser, onClickSignIn, onClickProfile }) => {
  if (!authUser) {
    return (
      <button className="pt-btn pt-btn-secondary pt-btn-sm" onClick={onClickSignIn}>
        {SIGN_IN} <FontAwesomeIcon icon={faGoogle} />
      </button>
    );
  }

  return (
    <Fragment>
      <button className="pt-btn pt-btn-secondary pt-btn-sm d-none d-sm-inline-flex" onClick={onClickProfile}>
        {authUser.displayName}
      </button>
      <button className="pt-btn-text d-block d-sm-none" onClick={onClickProfile}>
        <img src={profileIcon} style={{ width: 20 }} alt="" />
      </button>
    </Fragment>
  );
};

const NavigationAuth = ({
  authUser, onClickSignIn, onClickProfile, inputUrl, firebase
}) => (
  <Fragment>
    <Helmet bodyAttributes={{
      class: 'bg-light'
    }}>
      <meta charSet="utf-8" />
      <title>{TITLE}</title>
    </Helmet>
    <header className="pt-header">
      <div className="pt-header-inner">
        <div>
          <Logo />
        </div>
        <div className="pt-search-form">
          <AddUrlForm authUser={authUser} inputUrl={inputUrl} firebase={firebase} />
        </div>
        <div>
          <div className="d-flex justify-content-end align-items-center" style={{ gap: '8px' }}>
            <A className="text-muted" href="/" >
              <img src={notiIcon} alt="" />
            </A>

            <UserButton
              authUser={authUser}
              onClickProfile={onClickProfile}
              onClickSignIn={onClickSignIn} />
          </div>
        </div>
      </div>
    </header>
    <Menu authUser={authUser} />
  </Fragment>
);


class NavBarBase extends Component {
  state = { error: null, inputUrl: this.props.inputUrl }

  onClickSignIn = (event) => {
    this.props.firebase
      .doSignInWithGoogle()
      .then((socialAuthUser) => {
        console.log('socialAuthUser', socialAuthUser);
        this.setState({ error: null });
        navigate(ROUTES.HOME);
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error });
      });

    event.preventDefault();
  }

  onClickProfile = () => navigate(ROUTES.PROFILE)

  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) => <NavigationAuth authUser={authUser}
                                     onClickSignIn={this.onClickSignIn}
                                     onClickProfile={this.onClickProfile}
                                     onChangeInput={this.onChangeInput}
                                     onSubmit={this.onSubmit}
                                     inputUrl={this.state.inputUrl}
                                     firebase={this.props.firebase} />}
      </AuthUserContext.Consumer>
    );
  }
}

const NavBar = withFirebase(NavBarBase);
export default NavBar;