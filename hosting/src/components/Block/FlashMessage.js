import React from 'react';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong!';
export default class FlashMessage extends React.Component {
    state = {
      timer: 3
    }

    timer = null

    componentDidMount() {
      this.timer = setInterval(() => {
        if (this.state.timer > -1) this.setState({ timer: this.state.timer - 1 });
        else clearInterval(this.timer);
      }, 1000);
    }

    componentWillUnmount() {
      clearInterval(this.timer);
    }

    render() {
      if (this.state.timer > 0) {
        return (
            <div className="pt-flash">{this.props.message || DEFAULT_ERROR_MESSAGE}</div>
        );
      }
      return null;
    }
}