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
            .replace(/'/g, "&#039;")
            .replace(/`/g, "&#x60;");
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

const getBaseTagFromPropsList = (validTags, propsList) => {
    return propsList
        .filter(props => !Object.is(typeof props[TAG_NAMES.BASE], "undefined"))
        .map(props => props[TAG_NAMES.BASE])
        .reverse()
        .reduce((innermostBaseTag, tag) => {
            if (!innermostBaseTag.length) {
                for (const attributeKey of Object.keys(tag)) {
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();

                    if (!Object.is(validTags.indexOf(lowerCaseAttributeKey), -1)) {
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
                for (const attributeKey of Object.keys(tag)) {
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();
                    const value = tag[attributeKey].toLowerCase();

                    if (Object.is(validTags.indexOf(lowerCaseAttributeKey), -1)) {
                        return false;
                    }

                    if (!approvedSeenTags.has(lowerCaseAttributeKey)) {
                        approvedSeenTags.set(lowerCaseAttributeKey, new Set());
                    }

                    if (!instanceSeenTags.has(lowerCaseAttributeKey)) {
                        instanceSeenTags.set(lowerCaseAttributeKey, new Set());
                    }

                    if (!approvedSeenTags.get(lowerCaseAttributeKey).has(value)) {
                        instanceSeenTags.get(lowerCaseAttributeKey).add(value);
                        return true;
                    }

                    return false;
                }
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

const updateTags = (type, tags) => {
    const headElement = document.head || document.querySelector("head");
    const existingTags = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);

    // Remove any tags previously injected by Helmet
    Array.forEach(existingTags, tag => tag.parentNode.removeChild(tag));

    if (tags && tags.length) {
        tags
        .reverse()
        .forEach(tag => {
            const newElement = document.createElement(type);

            for (const attribute in tag) {
                if (tag.hasOwnProperty(attribute)) {
                    newElement.setAttribute(attribute, tag[attribute]);
                }
            }

            newElement.setAttribute(HELMET_ATTRIBUTE, "true");
            headElement.insertBefore(newElement, headElement.firstChild);
        });
    }
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

        return `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${Object.is(type, TAG_NAMES.SCRIPT) ? `></${type}>` : `/>`}`;
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
    const component = [...tags].map((tag, i) => {
        const mappedTag = {
            key: i,
            [HELMET_ATTRIBUTE]: true
        };

        Object.keys(tag).forEach((attribute) => {
            const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

            mappedTag[mappedAttribute] = encodeSpecialCharacters(tag[attribute]);
        });

        return React.createElement(type, mappedTag);
    });

    return component;
};

const Helmet = (Component) => {
    class HelmetWrapper extends React.Component {
        /**
         * @param {String} title: "Title"
         * @param {String} titleTemplate: "MySite.com - %s"
         * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
         * @param {Array} meta: [{"name": "description", "content": "Test description"}]
         * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
         * @param {Array} script: [{"src": "http://mysite.com/js/test.js", "type": "text/javascript"}]
         */
        static propTypes = {
            title: React.PropTypes.string,
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
        static rewind = Component.rewind

        static set canUseDOM(canUseDOM) {
            Component.canUseDOM = canUseDOM;
        }

        render() {
            return <Component {...this.props} />;
        }
    }

    return HelmetWrapper;
};

const reducePropsToState = (propsList) => {
    PlainComponent.reducePropsToStateCallback(propsList);

    return {
        title: getTitleFromPropsList(propsList),
        baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
        metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY], propsList),
        linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
        scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC], propsList)
    };
};

const handleClientStateChange = (newState) => {
    const {title, baseTag, metaTags, linkTags, scriptTags} = newState;

    updateTitle(title);
    updateTags(TAG_NAMES.SCRIPT, scriptTags);
    updateTags(TAG_NAMES.LINK, linkTags);
    updateTags(TAG_NAMES.META, metaTags);
    updateTags(TAG_NAMES.BASE, baseTag);

    PlainComponent.handleClientStateChangeCallback(newState);
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

const SideEffect = withSideEffect(
    reducePropsToState,
    handleClientStateChange,
    mapStateOnServer
);

// PlainComponent serves two purposes: 1) To be a blank component decorated by react-side-effect
// and 2) to expose static functions that can be used as callbacks for the functions we pass to react-side-effect (currently only utilized in unit tests)
export {PlainComponent};
export default Helmet(SideEffect(PlainComponent));
