import React from "react"

const style = {
    position: 'fixed',
    top: 0,
    left: 0,
    textAlign: 'center',
    background: '#ff3030cc',
    right: 0,
    color: '#fff',
    fontSize: 'small',
    padding: '5px'
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong!'
export default class FlashMessage extends React.Component {
    state = {
        timer: 3
    }
    timer = null

    componentDidMount() {
        this.timer = setInterval(() => {
            if (this.state.timer > -1) this.setState({ timer: this.state.timer - 1 })
            else clearInterval(this.timer)
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        if (this.state.timer > 0) return <div style={style}>{this.props.message || DEFAULT_ERROR_MESSAGE}</div>
        return null
    }
}