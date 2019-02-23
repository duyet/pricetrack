import React from "react"

import { LOGO } from '../../constants/config'
import { HOME } from '../../constants/routes'

import icon from '../../../static/icon.png'

export default () => <a className="text-muted nav-brand" href={HOME}>
    <img src={icon} alt={LOGO} className="img-fluid" width="50" height="50" />
</a>