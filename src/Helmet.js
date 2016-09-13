import React from "react";
import withSideEffect from "react-side-effect";
import deepEqual from "deep-equal";
import objectAssign from "object-assign";
import {
    TAG_NAMES,
    TAG_PROPERTIES,
    REACT_TAG_MAP
} from "./HelmetConstants.js";
import PlainComponent from "./PlainComponent";

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
        return innermostTemplate.replace(/\%s/g, innermostTitle);
    }

    const innermostDefaultTitle = getInnermostProperty(propsList, "defaultTitle");

    return innermostTitle || innermostDefaultTitle || "";
};

const getOnChangeClientState = (propsList) => {
    return getInnermostProperty(propsList, "onChangeClientState") ||(() => {});
};

const getHtmlAttributesFromPropsList = (propsList) => {
    return propsList
        .filter(props => typeof props[TAG_NAMES.HTML] !== "undefined")
        .map(props => props[TAG_NAMES.HTML])
        .reduce((html, current) => {
            return {...html, ...current};
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

                    if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1) {
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

    const tagList = propsList
        .filter(props => typeof props[tagName] !== "undefined")
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
                    if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === TAG_PROPERTIES.INNER_HTML || attributeKey === TAG_PROPERTIES.CSS_TEXT)) {
                        primaryAttributeKey = attributeKey;
                    }
                }

                if (!primaryAttributeKey) {
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

    return tagList;
};

const updateTitle = title => {
    document.title = title || document.title;
};

const updateHtmlAttributes = (attributes) => {
    const htmlTag = document.getElementsByTagName("html")[0];
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
        tags
        .forEach(tag => {
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

const generateHtmlAttributesAsString = (attributes) => {
    const keys = Object.keys(attributes);
    let attributeString = "";

    for (let i = 0; i < keys.length; i++) {
        const attribute = keys[i];
        const attr = typeof attributes[attribute] !== "undefined" ? `${attribute}="${attributes[attribute]}"` : `${attribute}`;
        attributeString += `${attr} `;
    }

    return attributeString.trim();
};

const generateTitleAsString = (type, title) => {
    const stringifiedMarkup = `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(title)}</${type}>`;

    return stringifiedMarkup;
};

const generateTagsAsString = (type, tags) => {
    const stringifiedMarkup = tags.map(tag => {
        const attributeHtml = Object.keys(tag)
            .filter(attribute => !(attribute === "innerHTML" || attribute === "cssText"))
            .map(attribute => {
                if (typeof tag[attribute] === "undefined") {
                    return attribute;
                }

                const encodedValue = encodeSpecialCharacters(tag[attribute]);
                return `${attribute}="${encodedValue}"`;
            })
            .join(" ").trim();

        const tagContent = tag.innerHTML || tag.cssText || "";

        return `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${type === TAG_NAMES.SCRIPT || type === TAG_NAMES.STYLE ? `>${tagContent}</${type}>` : `/>`}`;
    }).join("");

    return stringifiedMarkup;
};

const generateTitleAsReactComponent = (type, title) => {
    // assigning into an array to define toString function on it
    const component = [
        React.createElement(
            TAG_NAMES.TITLE,
            {
                key: title,
                [HELMET_ATTRIBUTE]: true
            },
            title
        )
    ];

    return component;
};

const generateTagsAsReactComponent = (type, tags) => {
    /* eslint-disable react/display-name */
    const component = tags.map((tag, i) => {
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

    return component;
    /* eslint-enable react/display-name */
};

const getMethodsForTag = (type, tags) => {
    switch (type) {
        case TAG_NAMES.TITLE:
            return {
                toComponent: () => generateTitleAsReactComponent(type, tags),
                toString: () => generateTitleAsString(type, tags)
            };
        case TAG_NAMES.HTML:
            return {
                toComponent: () => tags,
                toString: () => generateHtmlAttributesAsString(tags)
            };
        default:
            return {
                toComponent: () => generateTagsAsReactComponent(type, tags),
                toString: () => generateTagsAsString(type, tags)
            };
    }
};

const mapStateOnServer = ({htmlAttributes, title, baseTag, metaTags, linkTags, scriptTags, styleTags}) => ({
    htmlAttributes: getMethodsForTag(TAG_NAMES.HTML, htmlAttributes),
    title: getMethodsForTag(TAG_NAMES.TITLE, title),
    base: getMethodsForTag(TAG_NAMES.BASE, baseTag),
    meta: getMethodsForTag(TAG_NAMES.META, metaTags),
    link: getMethodsForTag(TAG_NAMES.LINK, linkTags),
    script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags),
    style: getMethodsForTag(TAG_NAMES.STYLE, styleTags)
});

const Helmet = (Component) => {
    /* eslint-disable react/no-multi-comp */
    class HelmetWrapper extends React.Component {
        /**
         * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
         * @param {String} title: "Title"
         * @param {String} defaultTitle: "Default Title"
         * @param {String} titleTemplate: "MySite.com - %s"
         * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
         * @param {Array} meta: [{"name": "description", "content": "Test description"}]
         * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
         * @param {Array} script: [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
         * @param {Array} style: [{"type": "text/css", "cssText": "div{ display: block; color: blue; }"}]
         * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
         */
        static propTypes = {
            htmlAttributes: React.PropTypes.object,
            title: React.PropTypes.string,
            defaultTitle: React.PropTypes.string,
            titleTemplate: React.PropTypes.string,
            base: React.PropTypes.object,
            meta: React.PropTypes.arrayOf(React.PropTypes.object),
            link: React.PropTypes.arrayOf(React.PropTypes.object),
            script: React.PropTypes.arrayOf(React.PropTypes.object),
            style: React.PropTypes.arrayOf(React.PropTypes.object),
            onChangeClientState: React.PropTypes.func
        }

        shouldComponentUpdate(nextProps) {
            return !deepEqual(this.props, nextProps);
        }

        // Component.peek comes from react-side-effect:
        // For testing, you may use a static peek() method available on the returned component.
        // It lets you get the current state without resetting the mounted instance stack.
        // Don’t use it for anything other than testing.
        static peek = Component.peek

        static rewind = () => {
            let mappedState = Component.rewind();
            if (!mappedState) {
                // provide fallback if mappedState is undefined
                mappedState = mapStateOnServer({
                    htmlAttributes: [],
                    title: "",
                    baseTag: [],
                    metaTags: [],
                    linkTags: [],
                    scriptTags: [],
                    styleTags: []
                });
            }

            return mappedState;
        }

        static setCanUseDOM = canUseDOM => {
            Component.canUseDOM = canUseDOM;
        }

        render() {
            return <Component {...this.props} />;
        }
    }
    /* eslint-enable react/no-multi-comp */

    return HelmetWrapper;
};

const reducePropsToState = (propsList) => ({
    htmlAttributes: getHtmlAttributesFromPropsList(propsList),
    title: getTitleFromPropsList(propsList),
    baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
    metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY], propsList),
    linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
    scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML], propsList),
    styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [TAG_PROPERTIES.CSS_TEXT], propsList),
    onChangeClientState: getOnChangeClientState(propsList)
});

const handleClientStateChange = (newState) => {
    const {
        htmlAttributes,
        title,
        baseTag,
        metaTags,
        linkTags,
        scriptTags,
        styleTags,
        onChangeClientState
    } = newState;

    updateHtmlAttributes(htmlAttributes);

    updateTitle(title);

    const tagUpdates = {
        baseTag: updateTags(TAG_NAMES.BASE, baseTag),
        metaTags: updateTags(TAG_NAMES.META, metaTags),
        linkTags: updateTags(TAG_NAMES.LINK, linkTags),
        scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
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

const SideEffect = withSideEffect(
    reducePropsToState,
    handleClientStateChange,
    mapStateOnServer
);

// PlainComponent is used to be a blank component decorated by react-side-effect
export default Helmet(SideEffect(PlainComponent));
