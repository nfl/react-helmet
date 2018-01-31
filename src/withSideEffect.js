import React, {Component} from "react";
import PropTypes from "prop-types";
import shallowEqual from "shallowequal";

export default function withSideEffect() {
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

        class SideEffect extends Component {
            // Try to use displayName of wrapped component
            static displayName = `SideEffect(${getDisplayName(
                WrappedComponent
            )})`;

            static contextTypes = {
                addInstance: PropTypes.func,
                deleteInstance: PropTypes.func,
                emitChange: PropTypes.func
            };

            componentWillMount() {
                this.context.addInstance(this);
                this.context.emitChange();
            }

            shouldComponentUpdate(nextProps) {
                return !shallowEqual(nextProps, this.props);
            }

            componentDidUpdate() {
                this.context.emitChange();
            }

            componentWillUnmount() {
                if (this.context.deleteInstance(this)) {
                    this.context.emitChange();
                }
            }

            render() {
                return <WrappedComponent {...this.props} />;
            }
        }

        return SideEffect;
    };
}
