import React from "react"

import IMG_LINECHART from '../../../static/animat-linechart-color.gif'
import IMG_CHECKMARK from '../../../static/animat-checkmark-color.gif'
import IMG_IMAGE from '../../../static/animat-image-color.gif'

const HEAD_LINE_PRICE_TRACKER = 'Theo dõi giá'

const style = {
    background: '#fff', 
    borderRadius: 5
}

const icons = {
    linechart: IMG_LINECHART,
    checkmark: IMG_CHECKMARK,
    image: IMG_IMAGE,
}

export default (props) => (
    <div className="d-flex flex-grow-1 align-items-center">
        <img className="mr-3" src={icons[props.icon || 'linechart']} alt="" width="48" height="48" style={style} />
        <div className="lh-100">
            <h6 className="mb-0 text-white lh-100">{props.headline || HEAD_LINE_PRICE_TRACKER}</h6>
            <small>{props.sub_headline || 'beta'}</small>
        </div>
    </div>
)