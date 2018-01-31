import React, { Component } from "react";
import PropTypes from "prop-types";
import {
    handleClientStateChange,
    mapStateOnServer,
    reducePropsToState
} from "./HelmetUtils.js";

const HelmetProvider = WrappedComponent =>
    class HelmetProviderWrapper extends Component {
        constructor(props, context) {
            super(props, context);
            this.onStateChange();
        }

        static propTypes = {
            children: PropTypes.oneOfType([
                PropTypes.arrayOf(PropTypes.node),
                PropTypes.node
            ]),
            onStateChange: PropTypes.func
        };

        static set canUseDOM(canUseDOM) {
            WrappedComponent.canUseDOM = canUseDOM;
        }

        onStateChange = state => {
            if (this.props.onStateChange) {
                this.props.onStateChange(
                    state ||
                        mapStateOnServer({
                            baseTag: [],
                            bodyAttributes: {},
                            encodeSpecialCharacters: true,
                            htmlAttributes: {},
                            linkTags: [],
                            metaTags: [],
                            noscriptTags: [],
                            scriptTags: [],
                            styleTags: [],
                            title: "",
                            titleAttributes: {}
                        })
                );
            }
        };

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    onStateChange={this.onStateChange}
                />
            );
        }
    };

const NullComponent = () => null;

const HelmetProviderSideEffects = withSideEffectProvider({
    reducePropsToState,
    handleStateChangeOnClient: handleClientStateChange,
    mapStateOnServer
})(NullComponent);

const HelmetProviderExport = HelmetProvider(HelmetProviderSideEffects);

export {HelmetProviderExport as HelmetProvider};
export default HelmetProviderExport;
