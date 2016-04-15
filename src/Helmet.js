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
    const reversedPropsList = [].concat(propsList).reverse();

    for (let i = 0; i < reversedPropsList.length; i++) {
        const props = reversedPropsList[i];

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

const getBaseTagFromPropsList = (validTags, propsList) => {
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

                    if (validTags.indexOf(lowerCaseAttributeKey) !== -1) {
                        return innermostBaseTag.concat(tag);
                    }
                }
            }

            return innermostBaseTag;
        }, []);
};

const getTagsFromPropsList = (tagName, validTags, propsList) => {
    // Calculate list of tags, giving priority innermost component (end of the propslist)
    const approvedSeenTags = {};

    const tagList = propsList
        .filter(props => typeof props[tagName] !== "undefined")
        .map(props => props[tagName])
        .reverse()
        .reduce((approvedTags, instanceTags) => {
            const instanceSeenTags = {};

            instanceTags.filter(tag => {
                let validAttributeKey;
                const keys = Object.keys(tag);
                for (let i = 0; i < keys.length; i++) {
                    const attributeKey = keys[i];
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();

                    // Special rule with link tags, since rel and href are both valid tags, rel takes priority
                    if (validTags.indexOf(lowerCaseAttributeKey) !== -1
                        && !(validAttributeKey === TAG_PROPERTIES.REL && tag[validAttributeKey].toLowerCase() === "canonical")
                        && !(lowerCaseAttributeKey === TAG_PROPERTIES.REL && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
                        validAttributeKey = lowerCaseAttributeKey;
                    }
                    // Special case for innerHTML which doesn't work lowercased
                    if (validTags.indexOf(attributeKey) !== -1 && attributeKey === TAG_PROPERTIES.INNER_HTML) {
                        validAttributeKey = attributeKey;
                    }
                }

                if (!validAttributeKey) {
                    return false;
                }

                const value = tag[validAttributeKey].toLowerCase();

                if (!approvedSeenTags[validAttributeKey]) {
                    approvedSeenTags[validAttributeKey] = {};
                }

                if (!instanceSeenTags[validAttributeKey]) {
                    instanceSeenTags[validAttributeKey] = {};
                }

                if (!approvedSeenTags[validAttributeKey][value]) {
                    instanceSeenTags[validAttributeKey][value] = true;
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

    htmlTag.setAttribute(HELMET_ATTRIBUTE, helmetAttributes.join(","));
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
                    } else {
                        newElement.setAttribute(attribute, tag[attribute]);
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
            .map((attribute) => {
                if (attribute === "innerHTML") {
                    return "";
                }
                const encodedValue = encodeSpecialCharacters(tag[attribute]);
                return `${attribute}="${encodedValue}"`;
            })
            .join(" ");

        const innerHTML = tag.innerHTML || "";

        return `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${type === TAG_NAMES.SCRIPT ? `>${innerHTML}</${type}>` : `/>`}`;
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

            if (mappedAttribute === "innerHTML") {
                mappedTag.dangerouslySetInnerHTML = {__html: tag.innerHTML};
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

const mapStateOnServer = ({title, baseTag, metaTags, linkTags, scriptTags, htmlAttributes}) => ({
    title: getMethodsForTag(TAG_NAMES.TITLE, title),
    base: getMethodsForTag(TAG_NAMES.BASE, baseTag),
    meta: getMethodsForTag(TAG_NAMES.META, metaTags),
    link: getMethodsForTag(TAG_NAMES.LINK, linkTags),
    script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags),
    htmlAttributes: getMethodsForTag(TAG_NAMES.HTML, htmlAttributes)
});

const Helmet = (Component) => {
    /* eslint-disable react/no-multi-comp */
    class HelmetWrapper extends React.Component {
        /**
         * @param {String} title: "Title"
         * @param {String} defaultTitle: "Default Title"
         * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
         * @param {String} titleTemplate: "MySite.com - %s"
         * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
         * @param {Array} meta: [{"name": "description", "content": "Test description"}]
         * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
         * @param {Array} script: [{"src": "http://mysite.com/js/test.js", "type": "text/javascript"}]
         * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
         */
        static propTypes = {
            title: React.PropTypes.string,
            defaultTitle: React.PropTypes.string,
            onChangeClientState: React.PropTypes.func,
            titleTemplate: React.PropTypes.string,
            base: React.PropTypes.object,
            meta: React.PropTypes.arrayOf(React.PropTypes.object),
            link: React.PropTypes.arrayOf(React.PropTypes.object),
            script: React.PropTypes.arrayOf(React.PropTypes.object),
            htmlAttributes: React.PropTypes.object
        }

        shouldComponentUpdate(nextProps) {
            return !deepEqual(this.props, nextProps);
        }

        // Component.peak comes from react-side-effect:
        // For testing, you may use a static peek() method available on the returned component.
        // It lets you get the current state without resetting the mounted instance stack.
        // Don’t use it for anything other than testing.
        static peek = Component.peek
        static rewind = () => {
            let mappedState = Component.rewind();
            if (!mappedState) {
                // provide fallback if mappedState is undefined
                mappedState = mapStateOnServer({
                    title: "",
                    baseTag: [],
                    metaTags: [],
                    linkTags: [],
                    scriptTags: [],
                    htmlAttributes: []
                });
            }

            return mappedState;
        }

        static set canUseDOM(canUseDOM) {
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
    title: getTitleFromPropsList(propsList),
    onChangeClientState: getOnChangeClientState(propsList),
    baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
    metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY], propsList),
    linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
    scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML, TAG_PROPERTIES.NAME], propsList),
    htmlAttributes: getHtmlAttributesFromPropsList(propsList)
});

const handleClientStateChange = (newState) => {
    const {title, htmlAttributes, baseTag, metaTags, linkTags, scriptTags, onChangeClientState} = newState;

    updateTitle(title);

    updateHtmlAttributes(htmlAttributes);

    const tagUpdates = {
        scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
        linkTags: updateTags(TAG_NAMES.LINK, linkTags),
        metaTags: updateTags(TAG_NAMES.META, metaTags),
        baseTag: updateTags(TAG_NAMES.BASE, baseTag)
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
