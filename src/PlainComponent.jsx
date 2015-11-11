import React from "react";

export default class PlainComponent extends React.Component {
    static reducePropsToStateCallback(propsList) {
        return propsList;
    }

    static handleClientStateChangeCallback(newState) {
        return newState;
    }

    static setReducePropsToStateCallback(callback) {
        this.reducePropsToStateCallback = callback;
    }

    static setClientStateChangeCallback(callback) {
        this.handleClientStateChangeCallback = callback;
    }

    render() {
        return null;
    }
}
