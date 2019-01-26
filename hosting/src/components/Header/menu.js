import React from "react"
import { Link } from "gatsby"

const ITEM_DASHBOARD = 'Trang chủ'
const ITEM_MY_PRODUCT = 'Sản phẩm của tôi'
const ITEM_ABOUT = 'Giới thiệu'

export default ({ authUser }) => (
    <div className="nav-scroller py-1 mb-2">
        <nav className="nav d-flex justify-content-center">
            <Link className="p-2 text-muted" to="/" activeStyle={{fontWeight: 700}}>{ITEM_DASHBOARD}</Link>
            { authUser 
                ? <Link className="p-2 text-muted" to="/my_product" activeStyle={{fontWeight: 700}}>{ITEM_MY_PRODUCT}</Link>
                : '' }
            <Link className="p-2 text-muted" to="/about" activeStyle={{fontWeight: 700}}>{ITEM_ABOUT}</Link>
        </nav>
    </div>
)