import React from 'react';
import { withFirebase } from '../Firebase';

class MessagingRequestPermission extends React.Component {
    onClick = () => {
      this.props.firebase.doMessagingRequestPermission();
    }

    render() {
      const { children } = this.props;
      return React.Children.map(children,
        (child) => React.cloneElement(child, { onClick: this.onClick }));
    }
}

export default withFirebase(MessagingRequestPermission);