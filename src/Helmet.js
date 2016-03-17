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
    return getInnermostProperty(propsList, "onChangeClientState") || () => {};
};

const getBaseTagFromPropsList = (validTags, propsList) => {
    return propsList
        .filter(props => typeof props[TAG_NAMES.BASE] !== "undefined")
        .map(props => props[TAG_NAMES.BASE])
        .reverse()
        .reduce((innermostBaseTag, tag) => {
            if (!innermostBaseTag.length) {
                for (const attributeKey of Object.keys(tag)) {
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
                }

                if (!validAttributeKey) {
                    return false;
                }

                const value = tag[validAttributeKey].toLowerCase();

                if (!approvedSeenTags[validAttributeKey]) {
                    approvedSeenTags[validAttributeKey] = new Set();
                }

                if (!instanceSeenTags[validAttributeKey]) {
                    instanceSeenTags[validAttributeKey] = new Set();
                }

                if (!approvedSeenTags[validAttributeKey].has(value)) {
                    instanceSeenTags[validAttributeKey].add(value);
                    return true;
                }

                return false;
            })
            .reverse()
            .forEach(tag => approvedTags.push(tag));

            // Update seen tags with tags from this instance
            const instanceKeys = Object.keys(instanceSeenTags);
            for (let i = 0; i < instanceKeys.length; i++) {
                const attributeKey = instanceKeys[i];
                const tagUnion = new Set([
                    ...approvedSeenTags[attributeKey],
                    ...instanceSeenTags[attributeKey]
                ]);

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
                    newElement.setAttribute(attribute, tag[attribute]);
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

const generateTitleAsString = (type, title) => {
    const stringifiedMarkup = `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(title)}</${type}>`;

    return stringifiedMarkup;
};

const generateTagsAsString = (type, tags) => {
    const stringifiedMarkup = tags.map(tag => {
        const attributeHtml = Object.keys(tag)
            .map((attribute) => {
                const encodedValue = encodeSpecialCharacters(tag[attribute]);
                return `${attribute}="${encodedValue}"`;
            })
            .join(" ");

        return `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${type === TAG_NAMES.SCRIPT ? `></${type}>` : `/>`}`;
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

            mappedTag[mappedAttribute] = tag[attribute];
        });

        return React.createElement(type, mappedTag);
    });

    return component;
    /* eslint-enable react/display-name */
};

const getMethodsForTag = (type, tags) => ({
    toComponent: (type === TAG_NAMES.TITLE) ? () => generateTitleAsReactComponent(type, tags) : () => generateTagsAsReactComponent(type, tags),
    toString: (type === TAG_NAMES.TITLE) ? () => generateTitleAsString(type, tags) : () => generateTagsAsString(type, tags)
});

const mapStateOnServer = ({title, baseTag, metaTags, linkTags, scriptTags}) => ({
    title: getMethodsForTag(TAG_NAMES.TITLE, title),
    base: getMethodsForTag(TAG_NAMES.BASE, baseTag),
    meta: getMethodsForTag(TAG_NAMES.META, metaTags),
    link: getMethodsForTag(TAG_NAMES.LINK, linkTags),
    script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags)
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
         */
        static propTypes = {
            title: React.PropTypes.string,
            onChangeClientState: React.PropTypes.func,
            titleTemplate: React.PropTypes.string,
            base: React.PropTypes.object,
            meta: React.PropTypes.arrayOf(React.PropTypes.object),
            link: React.PropTypes.arrayOf(React.PropTypes.object),
            script: React.PropTypes.arrayOf(React.PropTypes.object)
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
                    baseTag: "",
                    metaTags: "",
                    linkTags: "",
                    scriptTags: ""
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
    scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC], propsList)
});

const handleClientStateChange = (newState) => {
    const {title, baseTag, metaTags, linkTags, scriptTags, onChangeClientState} = newState;

    updateTitle(title);

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
