import React from "react"

const spinnersClass = ['primary', 'secondary', 'success', 'danger']
const spinners = spinnersClass.map(i => <div className={'spinner-grow text-' + i} role="status" key={i} />)

export default () => <div className="d-flex justify-content-center">{spinners}</div>