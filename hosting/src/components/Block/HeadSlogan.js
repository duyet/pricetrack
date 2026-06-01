import React from 'react';

import IMG_LINECHART from '../../../static/animat-linechart-color.gif';
import IMG_CHECKMARK from '../../../static/animat-checkmark-color.gif';
import IMG_IMAGE from '../../../static/animat-image-color.gif';

const HEAD_LINE_PRICE_TRACKER = 'Theo dõi giá';

const icons = {
  linechart: IMG_LINECHART,
  checkmark: IMG_CHECKMARK,
  image: IMG_IMAGE,
};

export default (props) => (
    <div className="d-flex flex-grow-1 align-items-center">
        <div className="pt-hero-icon">
            <img src={icons[props.icon || 'linechart']} alt="" width="28" height="28" />
        </div>
        <div>
            <h2 style={{ margin: 0 }}>{props.headline || HEAD_LINE_PRICE_TRACKER}</h2>
            <p>{props.sub_headline || 'beta'}</p>
        </div>
    </div>
);