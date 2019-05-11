import React from "react"
import { withFirebase } from '../Firebase'

class MessagingRequestPermission extends React.Component {
    onClick = (e) => {
        this.props.firebase.doMessagingRequestPermission()
    }

    render() {
        const { children } = this.props
        const childrenWithProps = React.Children.map(children, child =>
            React.cloneElement(child, { onClick: this.onClick })
        )
        return childrenWithProps
    }
}

export default withFirebase(MessagingRequestPermission)