import React from 'react';

export default ({ url, width = 80, height = 80 }) => (url.info && url.info.image
  ? <img src={url.info.image} width={width} height={height} alt="" />
  : <svg className="bd-placeholder-img mr-2 rounded" style={{ border: '1px solid #fff' }} width={width} height={height} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 32x32">
        <title>Placeholder</title>
        <rect fill={url.color} width="100%" height="100%"/>
        <text fill="#fff" dy=".3em" x="50%" y="50%">{url.domain.indexOf('shopee') > -1 ? 'S' : 'tiki'}</text>
    </svg>);