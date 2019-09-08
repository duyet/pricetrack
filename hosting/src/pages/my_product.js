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
const SUB_HEADLINE = 'Sản phẩm của tôi';

const SORT_TEXT = {
  my_product: 'Tất cả',
  my_product_following: 'Đang theo dõi',
};


class MyProductComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      urls: [],
      loading: false,
      error: false,

      orderBy: 'created_at',
      desc: 'true',
      addBy: '',
      following: false,
      currentMode: 'my_product',
      limit: DEFAULT_NUMBER_ITEMS,
      next: false,
      latest_params: {}
    };
  }

    orderByModes = () => Object.keys(this.SORT_TEXT)

    setOtherBy(mode) {
      const currentMode = mode;
      const { orderBy, desc } = this.state;
      const following = currentMode === 'my_product_following';

      let newDesc = desc;
      if (mode === this.state.currentMode) {
        newDesc = desc === 'true' ? 'false' : 'true';
      }
      const newAddBy = this.props.authUser.email;

      this.setState({
        currentMode, orderBy, desc: newDesc, addBy: newAddBy, following
      }, () => this._loadData());
    }

    async componentDidMount() {
      const authUser = this.props.authUser || {};
      const addBy = authUser.email || '';
      this.setState({ addBy }, () => this._loadData());
    }

    async _fetchData(params) {
      console.log('context authUser', this.props.authUser);

      const response = await axios.get('/api/listUrls', { params });
      const { data, headers } = response;
      const nextStartAt = headers.nextstartat || null;
      params['startAt'] = nextStartAt;

      return { urls: data, next: nextStartAt, params };
    }

    async _loadData() {
      this.setState({ loading: true });

      const params = {
        orderBy: this.state.orderBy,
        desc: this.state.desc,
        limit: this.state.limit,
        addBy: this.state.addBy,
        following: this.state.following
      };

      try {
        const { urls, next } = await this._fetchData(params);
        this.setState({
          urls, next, loading: false, latest_params: params
        });
      } catch (err) {
        console.error(err);
        this.setState({ loading: false, error: true });
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


    render() {
      return (
            <Layout>
                <div className="d-flex align-items-center p-3 my-3 text-white-50 rounded shadow-sm" style={{ background: '#03A9F4' }}>
                    <HeadSlogan sub_headline={SUB_HEADLINE} />

                    <div className="lh-100 mr-0 p-2 bd-highlight text-white">
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

const MyProductComponentWithContext = () => <AuthUserContext.Consumer>
        {(authUser) => (authUser ? <MyProductComponent authUser={authUser} /> : 'Loading ...')}
    </AuthUserContext.Consumer>;

export default withAuthentication(MyProductComponentWithContext);