import React from "react";
import invariant from "react/lib/invariant";
import shallowEqual from "react/lib/shallowEqual";
import Immutable from "immutable";

const RESERVED_PROPS = {
    arguments: true,
    caller: true,
    key: true,
    length: true,
    name: true,
    prototype: true,
    ref: true,
    type: true
};

export default (Component) => {
    invariant(
        typeof Object.is(Component.handleChange, "function"),
        "handleChange(propsList) is not a function."
    );

    let mountedInstances = Immutable.List();
    const emitChange = () => {
        Component.handleChange(mountedInstances.map(instance => instance.props));
    };

    class CreateSideEffect extends React.Component {
        static displayName = "CreateSideEffect"

        componentWillMount() {
            mountedInstances = mountedInstances.push(this);
            emitChange();
        }

        shouldComponentUpdate(nextProps) {
            return !shallowEqual(nextProps, this.props);
        }

        componentDidUpdate() {
            emitChange();
        }

        componentWillUnmount() {
            const index = mountedInstances.indexOf(this);
            mountedInstances = mountedInstances.splice(index, 1);
            emitChange();
        }

        static dispose() {
            mountedInstances = mountedInstances.clear();
            emitChange();
        }

        render() {
            return (
                <Component {...this.props} />
            );
        }
    }

    Object.getOwnPropertyNames(Component)
        .filter(componentKey => {
            return Component.hasOwnProperty(componentKey) && !RESERVED_PROPS[componentKey];
        })
        .forEach(componentKey => {
            CreateSideEffect[componentKey] = Component[componentKey];
        });

    return CreateSideEffect;
};
