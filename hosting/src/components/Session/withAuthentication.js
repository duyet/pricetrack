import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthentication = (Component) => {
  class WithAuthentication extends React.Component {
    _initFirebase = false;

    constructor(props) {
      super(props);

      this.state = {
        authUser: null,
        messagingToken: null
      };
    }

    firebaseInit = () => {
      if (this.props.firebase && !this._initFirebase) {
        this._initFirebase = true;

        this.listener = this.props.firebase.onAuthUserListener(
          (authUser) => {
            localStorage.setItem(
              'authUser',
              JSON.stringify(authUser),
            );
            authUser.getIdToken(true).then((idToken) => {
              localStorage.setItem(
                'authUserIdToken',
                idToken
              );
            }).catch((error) => {
              console.error(error);
            });

            this.setState({ authUser });
          },
          () => {
            localStorage.removeItem('authUser');
            this.setState({ authUser: null });
          },
        );

        const onMessagingSuccess = (token) => {
          localStorage.setItem(
            'messagingToken',
            JSON.stringify(token)
          );
          this.setState({ messagingToken: token });
        };
        const onMessagingError = () => {
          localStorage.removeItem('messagingToken');
          this.setState({ messagingToken: null });
        };
        this.props.firebase.onMessagingRequestPermission(
          onMessagingSuccess,
          onMessagingError
        );
        this.props.firebase.onMessagingTokenRefresh(
          onMessagingSuccess,
          onMessagingError
        );
      }
    };

    componentDidMount() {
      this.setState({
        authUser: JSON.parse(localStorage.getItem('authUser')),
      });

      this.firebaseInit();
    }

    componentDidUpdate() {
      this.firebaseInit();
    }

    componentWillUnmount() {
      return this.listener && this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
