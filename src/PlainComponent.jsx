import React from "react";

export default class PlainComponent extends React.Component {
    static reducePropsToStateCallback(propsList) {
        return propsList;
    }

    static handleClientStateChangeCallback(newState) {
        return newState;
    }

    render() {
        return null;
    }
}
