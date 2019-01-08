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
    <div className="container">
      <Header />
      <main role="main">
        {children}
      </main>
    </div>
  </Fragment>
));

export default Layout;