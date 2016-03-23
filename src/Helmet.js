import React from "react";
import withSideEffect from "react-side-effect";
import deepEqual from "deep-equal";
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
    for (const props of [...propsList].reverse()) {
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

    return innermostTitle || "";
};

const getOnChangeClientState = (propsList) => {
    return getInnermostProperty(propsList, "onChangeClientState") ||(() => {});
};

const getHtmlAttributesFromPropsList = (propsList) => {
    return propsList
        .filter(props => !Object.is(typeof props[TAG_NAMES.HTML], "undefined"))
        .map(props => props[TAG_NAMES.HTML])
        .reduce((html, current) => {
            return {...html, ...current};
        }, {});
};

const getBaseTagFromPropsList = (validTags, propsList) => {
    return propsList
        .filter(props => !Object.is(typeof props[TAG_NAMES.BASE], "undefined"))
        .map(props => props[TAG_NAMES.BASE])
        .reverse()
        .reduce((innermostBaseTag, tag) => {
            if (!innermostBaseTag.length) {
                for (const attributeKey of Object.keys(tag)) {
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();
                    if (validTags.includes(lowerCaseAttributeKey)) {
                        return innermostBaseTag.concat(tag);
                    }
                }
            }

            return innermostBaseTag;
        }, []);
};

const getTagsFromPropsList = (tagName, validTags, propsList) => {
    // Calculate list of tags, giving priority innermost component (end of the propslist)
    const approvedSeenTags = new Map();

    const tagList = propsList
        .filter(props => !Object.is(typeof props[tagName], "undefined"))
        .map(props => props[tagName])
        .reverse()
        .reduce((approvedTags, instanceTags) => {
            const instanceSeenTags = new Map();

            instanceTags.filter(tag => {
                let validAttributeKey;
                for (const attributeKey of Object.keys(tag)) {
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();

                    // Special rule with link tags, since rel and href are both valid tags, rel takes priority
                    if (validTags.includes(lowerCaseAttributeKey)
                        && !(Object.is(validAttributeKey, TAG_PROPERTIES.REL) && Object.is(tag[validAttributeKey].toLowerCase(), "canonical"))
                        && !(Object.is(lowerCaseAttributeKey, TAG_PROPERTIES.REL) && Object.is(tag[lowerCaseAttributeKey].toLowerCase(), "stylesheet"))) {
                        validAttributeKey = lowerCaseAttributeKey;
                    }
                    // Special case for innerHTML which doesn't work lowercased
                    if (validTags.includes(attributeKey) && Object.is(attributeKey, TAG_PROPERTIES.INNER_HTML)) {
                        validAttributeKey = attributeKey;
                    }
                }

                if (!validAttributeKey) {
                    return false;
                }

                const value = tag[validAttributeKey].toLowerCase();

                if (!approvedSeenTags.has(validAttributeKey)) {
                    approvedSeenTags.set(validAttributeKey, new Set());
                }

                if (!instanceSeenTags.has(validAttributeKey)) {
                    instanceSeenTags.set(validAttributeKey, new Set());
                }

                if (!approvedSeenTags.get(validAttributeKey).has(value)) {
                    instanceSeenTags.get(validAttributeKey).add(value);
                    return true;
                }

                return false;
            })
            .reverse()
            .forEach(tag => approvedTags.push(tag));

            // Update seen tags with tags from this instance
            for (const attributeKey of instanceSeenTags.keys()) {
                const tagUnion = new Set([
                    ...approvedSeenTags.get(attributeKey),
                    ...instanceSeenTags.get(attributeKey)
                ]);

                approvedSeenTags.set(attributeKey, tagUnion);
            }

            instanceSeenTags.clear();
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

    const oldAttributeCount = htmlTag.attributes.length;
    if (oldAttributeCount) {
        for (let i = oldAttributeCount - 1; i >= 0; i--) {
            htmlTag.removeAttribute(htmlTag.attributes[i].name);
        }
    }

    for (const attribute of Object.keys(attributes)) {
        const value = typeof attributes[attribute] === "undefined" ? "" : attributes[attribute];
        htmlTag.setAttribute(attribute, value);
    }
};

const updateTags = (type, tags) => {
    const headElement = document.head || document.querySelector("head");
    const oldTags = [...headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`)];
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
    let attributeString = "";

    for (const attribute of Object.keys(attributes)) {
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

        return `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${Object.is(type, TAG_NAMES.SCRIPT) ? `>${innerHTML}</${type}>` : `/>`}`;
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
    const component = [...tags].map((tag, i) => {
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
