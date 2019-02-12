import React from "react"
import { Link } from "gatsby"

import MENUS from '../../constants/menu'

export default ({ authUser }) => (
    <div className="nav-scroller py-1 mb-2">
        <nav className="nav d-flex justify-content-center">
            {
                MENUS.map(item => {
                    if (item.auth && !authUser) return null
                    return <Link key={item.path} className="p-2 text-muted" to={item.path} activeStyle={{fontWeight: 700}}>
                            {item.text}
                        </Link>
                })
            }
        </nav>
    </div>
)