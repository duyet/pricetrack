import React from "react"
import { Link } from "gatsby"

export default ({props}) => (
    <div className="nav-scroller py-1 mb-2">
        <nav className="nav d-flex justify-content-center">
            <Link className="p-2 text-muted" to="/">Dashboard</Link>
            <Link className="p-2 text-muted" to="/manage">Manage</Link>
            <Link className="p-2 text-muted" to="/cronjob">Cronjob</Link>
        </nav>
    </div>
)