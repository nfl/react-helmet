import React from "react";
import withSideEffect from "react-side-effect";
import deepEqual from "deep-equal";
import objectAssign from "object-assign";
import {
    TAG_NAMES,
    TAG_PROPERTIES,
    REACT_TAG_MAP,
    HTML_TAG_MAP
} from "./HelmetConstants.js";

const HELMET_ATTRIBUTE = "data-react-helmet";

const encodeSpecialCharacters = (str) => {
    return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;");
};

const getInnermostProperty = (propsList, property) => {
    for (let i = propsList.length - 1; i >= 0; i--) {
        const props = propsList[i];

        if (props[property]) {
            return props[property];
        }
    }
    return null;
};

const getTitleFromPropsList = (propsList) => {
    const innermostTitle = getInnermostProperty(propsList, "title");
    const innermostTemplate = getInnermostProperty(propsList, "titleTemplate");

    if (innermostTemplate && innermostTitle) {
        // use function arg to avoid need to escape $ characters
        return innermostTemplate.replace(/%s/g, () => innermostTitle);
    }

    const innermostDefaultTitle = getInnermostProperty(propsList, "defaultTitle");

    return innermostTitle || innermostDefaultTitle || "";
};

const getOnChangeClientState = (propsList) => {
    return getInnermostProperty(propsList, "onChangeClientState") ||(() => {});
};

const getAttributesFromPropsList = (tagType, propsList) => {
    return propsList
        .filter(props => typeof props[tagType] !== "undefined")
        .map(props => props[tagType])
        .reduce((tagAttrs, current) => {
            return {...tagAttrs, ...current};
        }, {});
};

const getBaseTagFromPropsList = (primaryAttributes, propsList) => {
    return propsList
        .filter(props => typeof props[TAG_NAMES.BASE] !== "undefined")
        .map(props => props[TAG_NAMES.BASE])
        .reverse()
        .reduce((innermostBaseTag, tag) => {
            if (!innermostBaseTag.length) {
                const keys = Object.keys(tag);

                for (let i = 0; i < keys.length; i++) {
                    const attributeKey = keys[i];
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();

                    if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
                        tag[lowerCaseAttributeKey]) {
                        return innermostBaseTag.concat(tag);
                    }
                }
            }

            return innermostBaseTag;
        }, []);
};

const getTagsFromPropsList = (tagName, primaryAttributes, propsList) => {
    // Calculate list of tags, giving priority innermost component (end of the propslist)
    const approvedSeenTags = {};

    return propsList
        .filter((props) => {
            if (Array.isArray(props[tagName])) {
                return true;
            }
            if (typeof props[tagName] !== "undefined") {
                warn(`Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[tagName]}"`);
            }
            return false;
        })
        .map(props => props[tagName])
        .reverse()
        .reduce((approvedTags, instanceTags) => {
            const instanceSeenTags = {};

            instanceTags.filter(tag => {
                let primaryAttributeKey;
                const keys = Object.keys(tag);
                for (let i = 0; i < keys.length; i++) {
                    const attributeKey = keys[i];
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();

                    // Special rule with link tags, since rel and href are both primary tags, rel takes priority
                    if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1
                        && !(primaryAttributeKey === TAG_PROPERTIES.REL && tag[primaryAttributeKey].toLowerCase() === "canonical")
                        && !(lowerCaseAttributeKey === TAG_PROPERTIES.REL && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
                        primaryAttributeKey = lowerCaseAttributeKey;
                    }
                    // Special case for innerHTML which doesn't work lowercased
                    if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === TAG_PROPERTIES.INNER_HTML || attributeKey === TAG_PROPERTIES.CSS_TEXT || attributeKey === TAG_PROPERTIES.ITEM_PROP)) {
                        primaryAttributeKey = attributeKey;
                    }
                }

                if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
                    return false;
                }

                const value = tag[primaryAttributeKey].toLowerCase();

                if (!approvedSeenTags[primaryAttributeKey]) {
                    approvedSeenTags[primaryAttributeKey] = {};
                }

                if (!instanceSeenTags[primaryAttributeKey]) {
                    instanceSeenTags[primaryAttributeKey] = {};
                }

                if (!approvedSeenTags[primaryAttributeKey][value]) {
                    instanceSeenTags[primaryAttributeKey][value] = true;
                    return true;
                }

                return false;
            })
            .reverse()
            .forEach(tag => approvedTags.push(tag));

            // Update seen tags with tags from this instance
            const keys = Object.keys(instanceSeenTags);
            for (let i = 0; i < keys.length; i++) {
                const attributeKey = keys[i];
                const tagUnion = objectAssign(
                    {},
                    approvedSeenTags[attributeKey],
                    instanceSeenTags[attributeKey]
                );

                approvedSeenTags[attributeKey] = tagUnion;
            }

            return approvedTags;
        }, [])
        .reverse();
};

const updateTitle = (title, attributes) => {
    document.title = title || document.title;
    updateAttributes(TAG_NAMES.TITLE, attributes);
};

const updateAttributes = (tagName, attributes) => {
    const htmlTag = document.getElementsByTagName(tagName)[0];
    const helmetAttributeString = htmlTag.getAttribute(HELMET_ATTRIBUTE);
    const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
    const attributesToRemove = [].concat(helmetAttributes);
    const attributeKeys = Object.keys(attributes);

    for (let i = 0; i < attributeKeys.length; i++) {
        const attribute = attributeKeys[i];
        const value = attributes[attribute] || "";
        htmlTag.setAttribute(attribute, value);

        if (helmetAttributes.indexOf(attribute) === -1) {
            helmetAttributes.push(attribute);
        }

        const indexToSave = attributesToRemove.indexOf(attribute);
        if (indexToSave !== -1) {
            attributesToRemove.splice(indexToSave, 1);
        }
    }

    for (let i = attributesToRemove.length - 1; i >= 0; i--) {
        htmlTag.removeAttribute(attributesToRemove[i]);
    }

    if (helmetAttributes.length === attributesToRemove.length) {
        htmlTag.removeAttribute(HELMET_ATTRIBUTE);
    } else {
        htmlTag.setAttribute(HELMET_ATTRIBUTE, helmetAttributes.join(","));
    }
};

const updateTags = (type, tags) => {
    const headElement = document.head || document.querySelector("head");
    const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
    const oldTags = Array.prototype.slice.call(tagNodes);
    const newTags = [];
    let indexToDelete;

    if (tags && tags.length) {
        tags.forEach(tag => {
            const newElement = document.createElement(type);

            for (const attribute in tag) {
                if (tag.hasOwnProperty(attribute)) {
                    if (attribute === "innerHTML") {
                        newElement.innerHTML = tag.innerHTML;
                    } else if (attribute === "cssText") {
                        if (newElement.styleSheet) {
                            newElement.styleSheet.cssText = tag.cssText;
                        } else {
                            newElement.appendChild(document.createTextNode(tag.cssText));
                        }
                    } else {
                        const value = (typeof tag[attribute] === "undefined") ? "" : tag[attribute];
                        newElement.setAttribute(attribute, value);
                    }
                }
            }

            newElement.setAttribute(HELMET_ATTRIBUTE, "true");

            // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
            if (oldTags.some((existingTag, index) => {
                indexToDelete = index;
                return newElement.isEqualNode(existingTag);
            })) {
                oldTags.splice(indexToDelete, 1);
            } else {
                newTags.push(newElement);
            }
        });
    }

    oldTags.forEach(tag => tag.parentNode.removeChild(tag));
    newTags.forEach(tag => headElement.appendChild(tag));

    return {
        oldTags,
        newTags
    };
};

const generateHtmlAttributesAsString = (attributes) => Object.keys(attributes)
    .reduce((str, key) => {
        const attr = typeof attributes[key] !== "undefined"
            ? `${key}="${attributes[key]}"`
            : `${key}`;
        return str ? `${str} ${attr}` : attr;
    }, "");

const generateTitleAsString = (type, title, attributes) => {
    const attributeString = generateHtmlAttributesAsString(attributes);
    return attributeString
        ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(title)}</${type}>`
        : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(title)}</${type}>`;
};

const generateTagsAsString = (type, tags) => tags.reduce((str, tag) => {
    const attributeHtml = Object.keys(tag)
        .filter(attribute => !(attribute === "innerHTML" || attribute === "cssText"))
        .reduce((string, attribute) => {
            const attr = typeof tag[attribute] === "undefined"
                ? attribute
                : `${attribute}="${encodeSpecialCharacters(tag[attribute])}"`;
            return string ? `${string} ${attr}` : attr;
        }, "");

    const tagContent = tag.innerHTML || tag.cssText || "";

    const isSelfClosing = [TAG_NAMES.NOSCRIPT, TAG_NAMES.SCRIPT, TAG_NAMES.STYLE].indexOf(type) === -1;

    return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${isSelfClosing ? `/>` : `>${tagContent}</${type}>`}`;
}, "");

const convertHtmlAttributestoReactProps = (attributes, initProps = {}) => {
    return Object.keys(attributes).reduce((obj, key) => {
        obj[(REACT_TAG_MAP[key] || key)] = attributes[key];
        return obj;
    }, initProps);
};

const convertReactPropstoHtmlAttributes = (props, initAttributes = {}) => {
    return Object.keys(props).reduce((obj, key) => {
        obj[(HTML_TAG_MAP[key] || key)] = props[key];
        return obj;
    }, initAttributes);
};

const generateTitleAsReactComponent = (type, title, attributes) => {
    // assigning into an array to define toString function on it
    const initProps = {
        key: title,
        [HELMET_ATTRIBUTE]: true
    };
    const props = convertHtmlAttributestoReactProps(attributes, initProps);

    return [React.createElement(TAG_NAMES.TITLE, props, title)];
};

const generateTagsAsReactComponent = (type, tags) => tags.map((tag, i) => {
    const mappedTag = {
        key: i,
        [HELMET_ATTRIBUTE]: true
    };

    Object.keys(tag).forEach((attribute) => {
        const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

        if (mappedAttribute === "innerHTML" || mappedAttribute === "cssText") {
            const content = tag.innerHTML || tag.cssText;
            mappedTag.dangerouslySetInnerHTML = {__html: content};
        } else {
            mappedTag[mappedAttribute] = tag[attribute];
        }
    });

    return React.createElement(type, mappedTag);
});

const getMethodsForTag = (type, tags) => {
    switch (type) {
        case TAG_NAMES.TITLE:
            return {
                toComponent: () => generateTitleAsReactComponent(type, tags.title, tags.titleAttributes),
                toString: () => generateTitleAsString(type, tags.title, tags.titleAttributes)
            };
        case TAG_NAMES.HTML:
            return {
                toComponent: () => convertHtmlAttributestoReactProps(tags),
                toString: () => generateHtmlAttributesAsString(tags)
            };
        default:
            return {
                toComponent: () => generateTagsAsReactComponent(type, tags),
                toString: () => generateTagsAsString(type, tags)
            };
    }
};

const mapStateOnServer = ({htmlAttributes, title, titleAttributes, baseTag, metaTags, linkTags, scriptTags, noscriptTags, styleTags}) => ({
    htmlAttributes: getMethodsForTag(TAG_NAMES.HTML, htmlAttributes),
    title: getMethodsForTag(TAG_NAMES.TITLE, {title, titleAttributes}),
    base: getMethodsForTag(TAG_NAMES.BASE, baseTag),
    meta: getMethodsForTag(TAG_NAMES.META, metaTags),
    link: getMethodsForTag(TAG_NAMES.LINK, linkTags),
    script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags),
    noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags),
    style: getMethodsForTag(TAG_NAMES.STYLE, styleTags)
});

const Helmet = (Component) => class HelmetWrapper extends React.Component {
    /**
     * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
     * @param {String} title: "Title"
     * @param {String} defaultTitle: "Default Title"
     * @param {String} titleTemplate: "MySite.com - %s"
     * @param {Object} titleAttributes: {"itemprop": "name"}
     * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
     * @param {Array} meta: [{"name": "description", "content": "Test description"}]
     * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
     * @param {Array} script: [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
     * @param {Array} noscript: [{"innerHTML": "<img src='http://mysite.com/js/test.js'"}]
     * @param {Array} style: [{"type": "text/css", "cssText": "div{ display: block; color: blue; }"}]
     * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
     */
    static propTypes = {
        htmlAttributes: React.PropTypes.object,
        title: React.PropTypes.string,
        defaultTitle: React.PropTypes.string,
        titleTemplate: React.PropTypes.string,
        titleAttributes: React.PropTypes.object,
        base: React.PropTypes.object,
        meta: React.PropTypes.arrayOf(React.PropTypes.object),
        link: React.PropTypes.arrayOf(React.PropTypes.object),
        script: React.PropTypes.arrayOf(React.PropTypes.object),
        noscript: React.PropTypes.arrayOf(React.PropTypes.object),
        style: React.PropTypes.arrayOf(React.PropTypes.object),
        onChangeClientState: React.PropTypes.func,
        children: React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.node),
            React.PropTypes.node
        ])
    };

    // Component.peek comes from react-side-effect:
    // For testing, you may use a static peek() method available on the returned component.
    // It lets you get the current state without resetting the mounted instance stack.
    // Don’t use it for anything other than testing.
    static peek = Component.peek;

    static rewind = () => {
        let mappedState = Component.rewind();
        if (!mappedState) {
            // provide fallback if mappedState is undefined
            mappedState = mapStateOnServer({
                htmlAttributes: {},
                title: "",
                titleAttributes: {},
                baseTag: [],
                metaTags: [],
                linkTags: [],
                scriptTags: [],
                noscriptTags: [],
                styleTags: []
            });
        }

        return mappedState;
    };

    static set canUseDOM(canUseDOM) {
        Component.canUseDOM = canUseDOM;
    }

    shouldComponentUpdate(nextProps) {
        return !deepEqual(this.props, nextProps);
    }

    mapNestedChildrenToProps(child, nestedChildren) {
        if (!nestedChildren) {
            return null;
        }

        switch (child.type) {
            case "script":
            case "noscript":
                return {
                    innerHTML: nestedChildren
                };

            case "style":
                return {
                    cssText: nestedChildren
                };
        }

        return nestedChildren;
    }

    flattenArrayTypeChildren({
        child,
        arrayTypeChildren,
        newChildProps,
        nestedChildren
    }) {
        return {
            ...arrayTypeChildren,
            [child.type]: [
                ...arrayTypeChildren[child.type] || [],
                {
                    ...newChildProps,
                    ...this.mapNestedChildrenToProps(child, nestedChildren)
                }
            ]
        };
    }

    mapObjectTypeChildren({
        child,
        newProps,
        newChildProps,
        nestedChildren
    }) {
        switch (child.type) {
            case "title":
                return {
                    ...newProps,
                    [child.type]: nestedChildren,
                    titleAttributes: {...newChildProps}
                };

            case "html":
                return {
                    ...newProps,
                    htmlAttributes: {...newChildProps}
                };
        }

        return {
            ...newProps,
            [child.type]: {...newChildProps}
        };
    }

    mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
        let newFlattenedProps = {...newProps};

        Object.keys(arrayTypeChildren)
            .forEach(arrayChildName => {
                newFlattenedProps = {
                    ...newFlattenedProps,
                    [arrayChildName]: arrayTypeChildren[arrayChildName]
                };
            });

        return newFlattenedProps;
    }

    warnOnInvalidChildren(child, nestedChildren) {
        if (
            process.env.NODE_ENV !== "production" &&
            nestedChildren &&
            typeof nestedChildren !== "string"
        ) {
            console.warn(`Helmet expects a single string as a child of ${child.type}`);
        }
    }

    mapChildrenToProps(children, newProps) {
        let arrayTypeChildren = {};

        React.Children.forEach(children, (child) => {
            const {children: nestedChildren, ...childProps} = child.props;
            const newChildProps = convertReactPropstoHtmlAttributes(childProps);

            this.warnOnInvalidChildren(child, nestedChildren);

            switch (child.type) {
                case "meta":
                case "link":
                case "script":
                case "noscript":
                case "style":
                    arrayTypeChildren = this.flattenArrayTypeChildren({
                        child,
                        arrayTypeChildren,
                        newChildProps,
                        nestedChildren
                    });
                    break;

                default:
                    newProps = this.mapObjectTypeChildren({
                        child,
                        newProps,
                        newChildProps,
                        nestedChildren
                    });
                    break;
            }
        });

        newProps = this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
        return newProps;
    }

    render() {
        const {children, ...props} = this.props;
        let newProps = {...props};

        if (children) {
            newProps = this.mapChildrenToProps(children, newProps);
        }

        return <Component {...newProps} />;
    }
};

const reducePropsToState = (propsList) => ({
    htmlAttributes: getAttributesFromPropsList(TAG_NAMES.HTML, propsList),
    title: getTitleFromPropsList(propsList),
    titleAttributes: getAttributesFromPropsList("titleAttributes", propsList),
    baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
    metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY, TAG_PROPERTIES.ITEM_PROP], propsList),
    linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
    scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML], propsList),
    noscriptTags: getTagsFromPropsList(TAG_NAMES.NOSCRIPT, [TAG_PROPERTIES.INNER_HTML], propsList),
    styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [TAG_PROPERTIES.CSS_TEXT], propsList),
    onChangeClientState: getOnChangeClientState(propsList)
});

const handleClientStateChange = (newState) => {
    const {
        htmlAttributes,
        title,
        titleAttributes,
        baseTag,
        metaTags,
        linkTags,
        scriptTags,
        noscriptTags,
        styleTags,
        onChangeClientState
    } = newState;

    updateAttributes("html", htmlAttributes);

    updateTitle(title, titleAttributes);

    const tagUpdates = {
        baseTag: updateTags(TAG_NAMES.BASE, baseTag),
        metaTags: updateTags(TAG_NAMES.META, metaTags),
        linkTags: updateTags(TAG_NAMES.LINK, linkTags),
        scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
        noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
        styleTags: updateTags(TAG_NAMES.STYLE, styleTags)
    };

    const addedTags = {};
    const removedTags = {};

    Object.keys(tagUpdates).forEach(tagType => {
        const {newTags, oldTags} = tagUpdates[tagType];

        if (newTags.length) {
            addedTags[tagType] = newTags;
        }
        if (oldTags.length) {
            removedTags[tagType] = tagUpdates[tagType].oldTags;
        }
    });

    onChangeClientState(newState, addedTags, removedTags);
};

const warn = (msg) => {
    return console && typeof console.warn === "function" && console.warn(msg);
};

const NullComponent = () => null;

const HelmetSideEffects = withSideEffect(
    reducePropsToState,
    handleClientStateChange,
    mapStateOnServer
)(NullComponent);

const HelmetExport = Helmet(HelmetSideEffects);
HelmetExport.renderStatic = HelmetExport.rewind;

export {HelmetExport as Helmet};
export default HelmetExport;
