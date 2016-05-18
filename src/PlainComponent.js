import React from "react";

export default class PlainComponent extends React.Component {
    static propTypes = {
        children: React.PropTypes.node
    }

    render() {
        if (this.props.children) {
            return React.Children.only(this.props.children);
        }
        return null;
    }
}
