import React, { PureComponent } from 'react';
import { loadProgressBar } from 'axios-progress-bar';
import 'axios-progress-bar/dist/nprogress.css';

import Layout from '../components/layout';
import { withAuthentication, AuthUserContext } from '../components/Session';

import HeadSlogan from '../components/Block/HeadSlogan';

loadProgressBar();

class Box extends PureComponent {
  render() {
    return JSON.stringify(this.props.location);
  }
}

class QuickAddComponent extends PureComponent {
    _mounted = true

    constructor(props) {
      super(props);
      this.state = {
        url: null,
        loading: false,
        error: false,
      };
    }

    async componentDidMount() {
      this._mounted = true;
    }

    _setState(state) {
      if (this._mounted) this.setState(state);
    }

    componentWillUnmount() {
      this._mounted = false;
    }

    render() {
      const { location } = this.props;
      return (
            <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{ background: '#03A9F4' }}>
                    <HeadSlogan />
                </div>
                <Box location={location} />
            </Layout>
      );
    }
}

const IndexWithContext = (props) => <AuthUserContext.Consumer>
    {(authUser) => <QuickAddComponent authUser={authUser} {...props} />}
</AuthUserContext.Consumer>;

export default withAuthentication(IndexWithContext);