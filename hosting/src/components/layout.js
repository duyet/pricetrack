import React, { Component, Fragment } from 'react';
import getFirebase, { FirebaseContext } from './Firebase';
import Header from './Header'
import withAuthentication from './Session/withAuthentication';

import "./layout.css"
import 'bootstrap/dist/css/bootstrap.css'


class Layout extends Component {
  state = {
    firebase: null,
  }

  componentDidMount() {
    const app = import('firebase/app');
    const auth = import('firebase/auth');
    const database = import('firebase/database');

    Promise.all([app, auth, database]).then(values => {
      const firebase = getFirebase(values[0]);

      this.setState({ firebase });
    });
  }

  render() {
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication {...this.props} />
      </FirebaseContext.Provider>
    );
  }
}

const AppWithAuthentication = withAuthentication(({ children }) => (
  <Fragment>
    <Header />

    <div className="nav-scroller bg-white shadow-sm">
      <nav className="nav nav-underline">
        <a className="nav-link active" href="#">Dashboard</a>
        <a className="nav-link" href="#">
          Update
          <span className="badge badge-pill bg-light align-text-bottom">27</span>
        </a>
        <a className="nav-link" href="#">Alert</a>
      </nav>
    </div>

    <main role="main" className="container-fluid">
      {children}
    </main>
  </Fragment>
));

export default Layout;