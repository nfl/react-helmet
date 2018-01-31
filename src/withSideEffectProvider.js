import React, {Component} from "react";
import PropTypes from "prop-types";
import ExecutionEnvironment from "exenv";
import "core-js/es6/array";
import "core-js/es6/set";

export default function withSideEffectProvider(
    handleStateChangeOnClient,
    mapStateOnServer,
    reducePropsToState
) {
    if (typeof reducePropsToState !== "function") {
        throw new Error("Expected reducePropsToState to be a function.");
    }
    if (typeof handleStateChangeOnClient !== "function") {
        throw new Error("Expected handleStateChangeOnClient to be a function.");
    }
    if (
        typeof mapStateOnServer !== "undefined" &&
        typeof mapStateOnServer !== "function"
    ) {
        throw new Error(
            "Expected mapStateOnServer to either be undefined or a function."
        );
    }

    function getDisplayName(WrappedComponent) {
        return (
            WrappedComponent.displayName || WrappedComponent.name || "Component"
        );
    }

    return function wrap(WrappedComponent) {
        if (typeof WrappedComponent !== "function") {
            throw new Error(
                "Expected WrappedComponent to be a React component."
            );
        }

        class SideEffectProvider extends Component {
            constructor(props, context) {
                super(props, context);
                this.instanceSet = new Set();
            }

            static displayName = `SideEffectProvider(${getDisplayName(
                WrappedComponent
            )})`;

            static canUseDOM = ExecutionEnvironment.canUseDOM;

            static propTypes = {
                children: PropTypes.oneOfType([
                    PropTypes.arrayOf(PropTypes.node),
                    PropTypes.node
                ]),
                onStateChange: PropTypes.func
            };

            static childContextTypes = {
                addInstance: PropTypes.func,
                deleteInstance: PropTypes.func,
                emitChange: PropTypes.func
            };

            getChildContext() {
                return {
                    addInstance: instance => this.instanceSet.add(instance),
                    deleteInstance: instance =>
                        this.instanceSet.delete(instance),
                    emitChange: () => {
                        let state = reducePropsToState(
                            Array.from(this.instanceSet).map(
                                instance => instance.props
                            )
                        );
                        if (SideEffectProvider.canUseDOM) {
                            handleStateChangeOnClient(state);
                        } else if (mapStateOnServer) {
                            state = mapStateOnServer(state);
                        }
                        this.props.onStateChange &&
                            this.props.onStateChange(state);
                    }
                };
            }

            render() {
                return React.Children.only(this.props.children);
            }
        }

        return SideEffectProvider;
    };
}
