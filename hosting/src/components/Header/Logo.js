import React from 'react';

import { LOGO } from '../../constants/config';
import { HOME } from '../../constants/routes';
import icon from '../../../static/icon.png';

const LOGO_SIZE = 50;

export default () => <a className="text-muted nav-brand" href={HOME}>
    <img src={icon} alt={LOGO} className="img-fluid" width={LOGO_SIZE} height={LOGO_SIZE} />
</a>;