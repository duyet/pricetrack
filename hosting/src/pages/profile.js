import React from 'react'
import { Link } from 'gatsby'
import moment from 'moment'

import Layout from '../components/layout'
import { withAuthentication, AuthUserContext } from '../components/Session'
import Loading from '../components/Block/Loading'
import * as ROUTES from '../constants/routes'

const PLEASE_LOGIN = 'Vui lòng đăng nhập'
const MY_PRODUCT = 'Sản phẩm của tôi'
// const LOGOUT_TEXT = 'Thoát'
const LOGOUT_CONFIRM_TEXT = 'Bạn có chắc?'
const LAST_LOGIN = 'Đăng nhập'
const REGISTER_AT = 'Đăng ký'

const CardLink = ({to = '#', text, bgClass = 'bg-success'}) => {
    return <div className={"card mb-3 " + bgClass} style={{maxWidth: '18rem'}}>
        <Link to={to}>
            <div className="card-body">
                <p className="card-text text-white">{text}</p>
            </div>
        </Link>
    </div>
}

class Profile extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            authUser: null
        }
    }

    componentDidMount() {
        this.setState({ authUser: this.props.authUser })
    }

    actionLogout = () => {
        if (window.confirm(LOGOUT_CONFIRM_TEXT) === true) {
          this.props.firebase.doSignOut()
        }
    }

    render() {
        if (!this.state.authUser) {
            return <Layout>{PLEASE_LOGIN}</Layout>
        }

        const authUser = this.state.authUser

        return <Layout>
            <div className="container">
                <div className="row my-3 p-3 bg-white rounded shadow-sm">
                    <div className="col-2">
                        <div className="text-center">
                            <img src={authUser.photoURL} className="img-fluid rounded mb-3" alt="..." />
                            <h6>{authUser.displayName}</h6>
                            <small>{authUser.email}</small>
                            {/* <a href="#" onClick={this.actionLogout}>{LOGOUT_TEXT}</a> */}
                        </div>
                    </div>
                    
                    <div className="col">
                        <CardLink to={ROUTES.MY_PRODUCT} text={MY_PRODUCT} />

                        <ul>
                            <li>
                                <small>{REGISTER_AT}: {moment(parseInt(authUser.createdAt)).fromNow()}</small>
                            </li>
                            <li>
                                <small>{LAST_LOGIN}: {moment(parseInt(authUser.lastLoginAt)).fromNow()}</small>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    }
}

const ProfileComponent = (props) => {
    return <AuthUserContext.Consumer>
                {authUser => authUser ? <Profile authUser={authUser} {...props} /> : <Loading />}
        </AuthUserContext.Consumer>
}

export default withAuthentication(ProfileComponent)