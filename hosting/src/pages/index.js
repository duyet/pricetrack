import React, { PureComponent } from 'react';
import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';
import 'axios-progress-bar/dist/nprogress.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTableCells } from '@fortawesome/free-solid-svg-icons';

import Layout from '../components/layout';
import ProductList from '../components/Block/ProductList';
import Loading from '../components/Block/Loading';
import { withAuthentication, AuthUserContext } from '../components/Session';

import HeadSlogan from '../components/Block/HeadSlogan';
import SortControl from '../components/Block/SortControl';

loadProgressBar();

const VIEW_STORAGE_KEY = 'pt_view_mode';

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
        latest_params: {},
        viewMode: 'list'
      };
    }

    setViewMode(viewMode) {
      this.setState({ viewMode });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
      }
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
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
        if (saved && saved !== this.state.viewMode) this.setState({ viewMode: saved });
      }
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
            view={this.state.viewMode}
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
                <div className="pt-hero">
                    <HeadSlogan />

                    <div className="pt-hero-controls">
                      <div className="pt-sort-controls">
                        <SortControl
                            sortText={SORT_TEXT}
                            currentMode={this.state.currentMode}
                            desc={this.state.desc} />
                      </div>

                      <div className="pt-view-toggle">
                        <button
                            type="button"
                            aria-label="List view"
                            className={`pt-view-btn ${this.state.viewMode === 'list' ? 'is-active' : ''}`}
                            onClick={() => this.setViewMode('list')}>
                            <FontAwesomeIcon icon={faList} />
                        </button>
                        <button
                            type="button"
                            aria-label="Grid view"
                            className={`pt-view-btn ${this.state.viewMode === 'grid' ? 'is-active' : ''}`}
                            onClick={() => this.setViewMode('grid')}>
                            <FontAwesomeIcon icon={faTableCells} />
                        </button>
                      </div>
                    </div>
                </div>

                <div className="pt-card my-3" id="listUrls">
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