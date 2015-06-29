import React from "react";
import invariant from "react/lib/invariant";
import shallowEqual from "react/lib/shallowEqual";

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

    const mountedInstances = new Set();
    const emitChange = () => {
        Component.handleChange([...mountedInstances].map(instance => instance.props));
    };

    class CreateSideEffect extends React.Component {
        static displayName = "CreateSideEffect"

        componentWillMount() {
            mountedInstances.add(this);
            emitChange();
        }

        shouldComponentUpdate(nextProps) {
            return !shallowEqual(nextProps, this.props);
        }

        componentDidUpdate() {
            emitChange();
        }

        componentWillUnmount() {
            if (mountedInstances.has(this)) {
                mountedInstances.delete(this);
            }

            emitChange();
        }

        static dispose() {
            mountedInstances.clear();
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
