import React, { Component, Fragment } from 'react';
import getFirebase, { FirebaseContext } from './Firebase';
import Header from './Header';
import withAuthentication from './Session/withAuthentication';

import './layout.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/design-system.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

const AppWithAuthentication = withAuthentication(({ children, inputUrl }) => (
  <Fragment>
    <div className="pt-container">
      <Header inputUrl={inputUrl} />
      <main role="main">
        {children}
      </main>
    </div>
  </Fragment>
));

class Layout extends Component {
  state = {
    firebase: null
  }

  componentDidMount() {
    const app = import('firebase/compat/app');
    const auth = import('firebase/compat/auth');
    const database = import('firebase/compat/database');
    const messaging = import('firebase/compat/messaging');
    const performance = import('firebase/compat/performance');

    Promise.all([app, auth, database, messaging, performance]).then((values) => {
      // firebase/compat/* exposes the v8 namespace as the module default export
      const firebase = getFirebase(values[0].default);
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


export default Layout;