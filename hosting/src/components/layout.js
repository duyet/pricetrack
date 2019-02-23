import React, { Component, Fragment } from 'react';
import getFirebase, { FirebaseContext } from './Firebase';
import Header from './Header'
import withAuthentication from './Session/withAuthentication';

import './layout.css'
import 'bootstrap/dist/css/bootstrap.css'
import './theme.css'
import '@fortawesome/fontawesome-svg-core/styles.css'

const AppWithAuthentication = withAuthentication(({ children, inputUrl }) => (
  <Fragment>
    <div className="container">
      <Header inputUrl={inputUrl} />
      <main role="main">
        {children}
      </main>
    </div>
  </Fragment>
))

class Layout extends Component {
  state = {
    firebase: null
  }

  componentDidMount() {
    const app = import('firebase/app')
    const auth = import('firebase/auth')
    const database = import('firebase/database')
    const messaging = import('firebase/messaging')
    Promise.all([app, auth, database, messaging]).then(values => {
      const firebase = getFirebase(values[0])
      this.setState({ firebase })
    })
  }

  render() {
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication {...this.props} />
      </FirebaseContext.Provider>
    );
  }
}


export default Layout