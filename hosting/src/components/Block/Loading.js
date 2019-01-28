import React from "react"

const spinnersClass = ['primary', 'secondary', 'success', 'danger']
const spinners = []

for (let i of spinnersClass) {
    spinners.push(
        <div className={'spinner-grow text-' + i} role="status" key={i}>
          <span className="sr-only">Loading...</span>
        </div>
    )
}

export default () => <div className="d-flex justify-content-center">{spinners}</div>