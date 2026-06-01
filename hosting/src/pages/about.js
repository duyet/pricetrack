import React, { Component } from 'react';

import Layout from '../components/layout';
import CrawlerStatus from '../components/Block/CrawlerStatus';
import Stats from '../components/Block/Stats';
import HeadSlogan from '../components/Block/HeadSlogan';

/**
 * This page is ad hoc, please modify it
 */

export default class IndexComponent extends Component {
    aboutImage = '//i.imgur.com/FgA3sgu.png';

    imageCredit = '';

    render() {
      return (
            <Layout>
                <div className="pt-hero">
                    <HeadSlogan icon="image" sub_headline="Giới thiệu" />
                </div>

                <div className="pt-card my-3 row">
                    <div className="col mb-3">
                        Pricetrack là ứng dụng theo dõi giá trên các trang TMDT lớn
                        như tiki.vn, shopee.vn,... hoàn toàn miễn phí <br />
                        Pricetrack có thể sẽ được một phần hoa hồng nhỏ khi bạn mua sản phẩm. <br />
                        Pricetrack là phần mềm <a href="https://github.com/duyetdev/pricetracker" target="_blank" rel="noopener noreferrer">nguồn mở</a>. <br />

                        <br /><br />
                        <h4>Trạng thái hệ thống</h4>
                        <CrawlerStatus />

                        <h4>Thống kê</h4>
                        <Stats />

                        <br />
                        <hr />
                        Liên hệ me [at] duyet dot net
                    </div>

                    <div className="col-md-5 col-xs-12 text-center">
                        <img className="img-fluid " src={this.aboutImage} alt="" />
                        <small>{this.imageCredit}</small>
                    </div>
                </div>

            </Layout>
      );
    }
}