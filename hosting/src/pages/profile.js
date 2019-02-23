import React from 'react'
import { Link } from 'gatsby'
import moment from 'moment'

import Layout from '../components/layout'
import { withAuthentication, AuthUserContext } from '../components/Session'
import SignOutLink from '../components/Block/SignOutLink'

const PLEASE_LOGIN = 'Vui lòng đăng nhập'
const HEAD_BASIC_INFO = 'Thông tin cơ bản'
const TEXT_EMAIL = 'Email'
const LAST_LOGIN = 'Đăng nhập'
const REGISTER_AT = 'Đăng ký'
const HEAD_LINKS = 'Liên kết'
const LINK_MY_PRODUCT = 'Sản phẩm của tôi'
const HEAD_OPTION = 'Tùy chỉnh'

const style = {
    textSm: {
        fontSize: '13px'
    }
}


class Profile extends React.Component {
    render() {
        if (!this.props.authUser) {
            return <Layout>{PLEASE_LOGIN}</Layout>
        }

        const authUser = this.props.authUser

        return (
            <Layout>
                <div className="container" style={style.textSm}>
                    <div className="row my-3 p-3 bg-white rounded shadow-sm">
                        <div className="col border-bottom border-light mb-3 p-3 d-flex flex-column justify-content-center">
                            <div className="d-flex flex-column justify-content-center mx-auto text-center">
                                <img src={authUser.photoURL} style={{maxWidth: 150}} className="img-fluid rounded mb-3" alt="..." />
                                <h6>{authUser.displayName}</h6>
                                <small>{authUser.email}</small>
                            </div>
                        </div>
                        
                        <div className="col">
                            <h6>{HEAD_BASIC_INFO}</h6>
                            <ul style={style.textSm}>
                                <li>
                                    {TEXT_EMAIL}: {authUser.email}
                                </li>
                                <li>
                                    {REGISTER_AT}: {moment(parseInt(authUser.createdAt)).fromNow()}
                                </li>
                                <li>
                                    {LAST_LOGIN}: {moment(parseInt(authUser.lastLoginAt)).fromNow()}
                                </li>
                            </ul>
                            
                            <h6>{HEAD_LINKS}</h6>
                            <ul style={style.textSm}>
                                <li>
                                    <Link to="/my_product/">{LINK_MY_PRODUCT}</Link>
                                </li>
                                <li>
                                    <SignOutLink style={style.textSm} />
                                </li>
                            </ul>
                        </div>
                        <div className="col">
                            <h6>{HEAD_OPTION}</h6>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="setting" disabled="disabled" value="hide_email" />
                                <label className="form-check-label" forhtml="setting">Ẩn email của tôi</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }
}

const ProfileComponent = props => (
    <AuthUserContext.Consumer>
        {authUser => <Profile authUser={authUser} {...props} />}
    </AuthUserContext.Consumer>
)

export default withAuthentication(ProfileComponent)