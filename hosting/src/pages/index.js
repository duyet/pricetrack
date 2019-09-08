import React, { PureComponent } from 'react';
import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';
import 'axios-progress-bar/dist/nprogress.css';

import Layout from '../components/layout';
import ProductList from '../components/Block/ProductList';
import Loading from '../components/Block/Loading';
import { withAuthentication, AuthUserContext } from '../components/Session';

import HeadSlogan from '../components/Block/HeadSlogan';
import SortControl from '../components/Block/SortControl';

loadProgressBar();

const DEFAULT_NUMBER_ITEMS = 15;
const SORT_TEXT = {
  price_change: 'Giá mới thay đổi',
  last_added: 'Mới thêm',
};


class IndexComponent extends PureComponent {
    _mounted = true

    constructor(props) {
      super(props);
      this.state = {
        urls: [],
        loading: false,
        error: false,
        orderBy: 'created_at', // [created_at, last_pull_at, price_change]
        desc: 'true',
        currentMode: 'last_added',
        limit: DEFAULT_NUMBER_ITEMS,
        next: false,
        latest_params: {}
      };
    }

    orderByModes = () => Object.keys(SORT_TEXT)

    setOtherBy(mode) {
      const currentMode = mode;
      let { orderBy, desc } = this.state;

      if (mode === this.state.currentMode) {
        desc = desc === 'true' ? 'false' : 'true';
      }

      if (mode === 'price_change') {
        orderBy = 'price_change_at';
      } else if (mode === 'last_added') {
        orderBy = 'created_at';
      }

      this.setState({ currentMode, orderBy, desc }, () => this._loadData());
    }

    async componentDidMount() {
      this._mounted = true;
      this._loadData();
    }

    async _fetchData(params) {
      console.log('context authUser', this.props.authUser);

      const response = await axios.get('/api/listUrls', { params });
      const { data, headers } = response;
      const nextStartAt = headers.nextstartat || null;
      params['startAt'] = nextStartAt;

      return { urls: data, next: nextStartAt, params };
    }

    _setState(state) {
      if (this._mounted) this.setState(state);
    }

    async _loadData() {
      this.setState({ loading: true });

      const params = {
        orderBy: this.state.orderBy,
        desc: this.state.desc,
        limit: this.state.limit
      };

      try {
        const { urls, next } = await this._fetchData(params);
        this._setState({
          urls, next, loading: false, latest_params: params
        });
      } catch (err) {
        console.error(err);
        this._setState({ loading: false, error: true });
      }
    }

    async onClickLoadMore(params) {
      try {
        const { urls, next } = await this._fetchData(params);
        const newUrls = [...this.state.urls, ...urls];
        this.setState({ urls: newUrls, next });
      } catch (err) {
        console.error(err);
        this.setState({ loading: false, error: true });
      }
    }

    renderListUrl() {
      if (this.state.loading) return <Loading />;
      if (this.state.error) return 'Some thing went wrong';

      return <ProductList urls={this.state.urls}
            loadMore={this.state.next}
            onClickLoadMore={
                () => this.onClickLoadMore(this.state.latest_params)
            } />;
    }

    componentWillUnmount() {
      this._mounted = false;
    }

    render() {
      return (
            <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{ background: '#03A9F4' }}>
                    <HeadSlogan />

                    <div className="lh-100 mr-0 p-2 bd-highlight text-white justify-content-end">
                      <SortControl
                          sortText={SORT_TEXT}
                          currentMode={this.state.currentMode}
                          desc={this.state.desc} />
                    </div>
                </div>

                <div className="my-3 p-3 bg-white rounded shadow-sm" id="listUrls">
                    {this.renderListUrl()}
                </div>
            </Layout>
      );
    }
}

const IndexWithContext = (props) => <AuthUserContext.Consumer>
    {(authUser) => <IndexComponent authUser={authUser} {...props} />}
</AuthUserContext.Consumer>;

export default withAuthentication(IndexWithContext);