import React from "react";
import objectAssign from "object-assign";
import _ from "lodash";
import {
    ATTRIBUTE_NAMES,
    HELMET_ATTRIBUTE,
    HELMET_PROPS,
    HTML_TAG_MAP,
    REACT_TAG_MAP,
    SELF_CLOSING_TAGS,
    TAG_NAMES,
    TAG_PROPERTIES
} from "./HelmetConstants.js";

const encodeSpecialCharacters = (str, encode = true) => {
    if (encode === false) {
        return String(str);
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
};

const groupByWindow = (propsList) => {
    return _.groupBy(propsList, props => {
        let win;
        if (props.window) {
            win = props.window;
        } else if (props.document) {
            win = props.document.defaultView ? props.document.defaultView : props.document.parentView;
        } else {
            win = window;
        }
        return winId(win);
    });
};

const getTitleFromPropsList = (propsList) => {
    const innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
    const innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);

    if (innermostTemplate && innermostTitle) {
        // use function arg to avoid need to escape $ characters
        return innermostTemplate.replace(/%s/g, () => innermostTitle);
    }

    const innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);

    return innermostTitle || innermostDefaultTitle || undefined;
};

const getOnChangeClientState = (propsList) => {
    return getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || (() => {});
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
                    if (
                        primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
                        !(
                            primaryAttributeKey === TAG_PROPERTIES.REL &&
                            tag[primaryAttributeKey].toLowerCase() === "canonical"
                        ) &&
                        !(
                            lowerCaseAttributeKey === TAG_PROPERTIES.REL &&
                            tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet"
                        )
                    ) {
                        primaryAttributeKey = lowerCaseAttributeKey;
                    }
                    // Special case for innerHTML which doesn't work lowercased
                    if (
                        primaryAttributes.indexOf(attributeKey) !== -1 &&
                        (
                            attributeKey === TAG_PROPERTIES.INNER_HTML ||
                            attributeKey === TAG_PROPERTIES.CSS_TEXT ||
                            attributeKey === TAG_PROPERTIES.ITEM_PROP
                        )
                    ) {
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

const getInnermostProperty = (propsList, property) => {
    for (let i = propsList.length - 1; i >= 0; i--) {
        const props = propsList[i];

        if (props.hasOwnProperty(property)) {
            return props[property];
        }
    }

    return null;
};


const reducePropsToState = (propsList) => {
    const groupedPropsList = propsList.length > 0 ? groupByWindow(propsList) : [[]];
    const states = _.map(groupedPropsList, _propsList => {
        return {
            window: _propsList[0] ? _propsList[0].window : window,
            document: _propsList[0] ? _propsList[0].document : document,
            baseTag: getBaseTagFromPropsList([
                TAG_PROPERTIES.HREF
            ], _propsList),
            bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, _propsList),
            encode: getInnermostProperty(_propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
            htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, _propsList),
            linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [
                TAG_PROPERTIES.REL,
                TAG_PROPERTIES.HREF
            ], _propsList),
            metaTags: getTagsFromPropsList(TAG_NAMES.META, [
                TAG_PROPERTIES.NAME,
                TAG_PROPERTIES.CHARSET,
                TAG_PROPERTIES.HTTPEQUIV,
                TAG_PROPERTIES.PROPERTY,
                TAG_PROPERTIES.ITEM_PROP
            ], _propsList),
            noscriptTags: getTagsFromPropsList(TAG_NAMES.NOSCRIPT, [
                TAG_PROPERTIES.INNER_HTML
            ], _propsList),
            onChangeClientState: getOnChangeClientState(_propsList),
            scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [
                TAG_PROPERTIES.SRC,
                TAG_PROPERTIES.INNER_HTML
            ], _propsList),
            styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [
                TAG_PROPERTIES.CSS_TEXT
            ], _propsList),
            title: getTitleFromPropsList(_propsList),
            titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, _propsList)
        };
    });
    states.window = states[0] ? states[0].window : window;
    states.document = states[0] ? states[0].document : document;
    states.baseTag = states[0] ? states[0].baseTag : [];
    states.bodyAttributes = states[0] ? states[0].bodyAttributes : [];
    states.encode = states[0] ? states[0].encode : null;
    states.htmlAttributes = states[0] ? states[0].htmlAttributes : [];
    states.linkTags = states[0] ? states[0].linkTags : [];
    states.metaTags = states[0] ? states[0].metaTags : [];
    states.noscriptTags = states[0] ? states[0].noscriptTags : [];
    states.onChangeClientState = states[0] ? states[0].onChangeClientState : () => {};
    states.scriptTags = states[0] ? states[0].scriptTags : [];
    states.styleTags = states[0] ? states[0].styleTags : [];
    states.title = states[0] ? states[0].title : "";
    states.titleAttributes = states[0] ? states[0].titleAttributes : [];
    return states;
};

const requestIdleCallback = (() => {
    return (cb, option) => {
        let _win;
        if (typeof option !== "undefined") {
            _win = typeof option.window !== "undefined" ? option.window : window;
        }
        if (typeof _win !== "undefined" && typeof _win.requestIdleCallback !== "undefined") {
            return _win.requestIdleCallback(cb, option);
        }

        const start = Date.now();
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };
})();


const cancelIdleCallback = (() => {
    return (id, option) => {
        const _win = typeof option.window !== "undefined" ? option.window : window;
        if (typeof _win !== "undefined" && typeof _win.cancelIdleCallback !== "undefined") {
            return _win.cancelIdleCallback(id);
        }
        return clearTimeout(id);
    };
})();

const warn = (msg) => {
    return console && typeof console.warn === "function" && console.warn(msg);
};

const winId = (win) => {
    if (!win) {
        return "undefined";
    }
    if (typeof win.parent === "undefined" || win.parent === win) {
        return "root";
    }
    const ids = [];
    while (typeof win.parent !== "undefined" && win.parent !== win) {
        const parent = win.parent;
        const frames = parent.frames;
        ids.push(_.indexOf(frames, win));
        win = parent;
    }
    ids.push("root");
    return ids.reverse().join(".");
};

const _helmetIdleCallbacks = {};

const handleClientStateChange = (newStates) => {
    for (const newState of newStates) {
        const {
            window,
            document,
            baseTag,
            bodyAttributes,
            htmlAttributes,
            linkTags,
            metaTags,
            noscriptTags,
            onChangeClientState,
            scriptTags,
            styleTags,
            title,
            titleAttributes
        } = newState;

        const cbId = winId(window);
        if (_helmetIdleCallbacks[cbId]) {
            cancelIdleCallback(_helmetIdleCallbacks[cbId], {window});
            delete _helmetIdleCallbacks[cbId];
        }

        _helmetIdleCallbacks[cbId] = requestIdleCallback(() => {
            updateAttributes(TAG_NAMES.BODY, bodyAttributes, document);
            updateAttributes(TAG_NAMES.HTML, htmlAttributes, document);

            updateTitle(title, titleAttributes, document);

            const tagUpdates = {
                baseTag: updateTags(TAG_NAMES.BASE, baseTag, document),
                linkTags: updateTags(TAG_NAMES.LINK, linkTags, document),
                metaTags: updateTags(TAG_NAMES.META, metaTags, document),
                noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags, document),
                scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags, document),
                styleTags: updateTags(TAG_NAMES.STYLE, styleTags, document)
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

            delete _helmetIdleCallbacks[cbId];
            onChangeClientState(newState, addedTags, removedTags);
        }, {window});
    }
};

const updateTitle = (title, attributes, document) => {
    if (typeof title === "string" && document.title !== title) {
        document.title = title;
    }

    updateAttributes(TAG_NAMES.TITLE, attributes, document);
};

const styleToString = (style) => {
    if (_.isString(style)) {
        return style;
    }
    return _(style).toPairs().map(([k, v]) => {
        k = (/(^Moz)|(^O)|(^Webkit)/ig).test(k) ? `-${_.lowerFirst(_.kebabCase(k))}` : _.kebabCase(k);
        return `${k}: ${v};`;
    }).join(" ");
};

const updateAttributes = (tagName, attributes, document) => {
    const elementTag = document.getElementsByTagName(tagName)[0];

    if (!elementTag) {
        return;
    }

    const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
    const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
    const attributesToRemove = [].concat(helmetAttributes);
    const attributeKeys = Object.keys(attributes);

    for (let i = 0; i < attributeKeys.length; i++) {
        const attribute = attributeKeys[i];
        const value = attributes[attribute] || "";

        let _value;
        if (attribute === "style") {
            _value = styleToString(value);
        } else {
            _value = value;
        }
        if (elementTag.getAttribute(attribute) !== _value) {
            elementTag.setAttribute(attribute, _value);
        }

        if (helmetAttributes.indexOf(attribute) === -1) {
            helmetAttributes.push(attribute);
        }

        const indexToSave = attributesToRemove.indexOf(attribute);
        if (indexToSave !== -1) {
            attributesToRemove.splice(indexToSave, 1);
        }
    }

    for (let i = attributesToRemove.length - 1; i >= 0; i--) {
        elementTag.removeAttribute(attributesToRemove[i]);
    }

    if (helmetAttributes.length === attributesToRemove.length) {
        elementTag.removeAttribute(HELMET_ATTRIBUTE);
    } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) {
        elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
    }
};

const updateTags = (type, tags, document) => {
    const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
    const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
    const oldTags = Array.prototype.slice.call(tagNodes);
    const newTags = [];
    let indexToDelete;

    if (tags && tags.length) {
        tags.forEach(tag => {
            const newElement = document.createElement(type);

            for (const attribute in tag) {
                if (tag.hasOwnProperty(attribute)) {
                    if (attribute === TAG_PROPERTIES.INNER_HTML) {
                        newElement.innerHTML = tag.innerHTML;
                    } else if (attribute === TAG_PROPERTIES.CSS_TEXT) {
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

const generateElementAttributesAsString = (attributes) => Object.keys(attributes)
    .reduce((str, key) => {
        const attr = typeof attributes[key] !== "undefined"
            ? `${key}="${attributes[key]}"`
            : `${key}`;
        return str ? `${str} ${attr}` : attr;
    }, "");

const generateTitleAsString = (type, title, attributes, encode) => {
    const attributeString = generateElementAttributesAsString(attributes);
    return attributeString
        ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(title, encode)}</${type}>`
        : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(title, encode)}</${type}>`;
};

const generateTagsAsString = (type, tags, encode) => tags.reduce((str, tag) => {
    const attributeHtml = Object.keys(tag)
        .filter(attribute => !(attribute === TAG_PROPERTIES.INNER_HTML || attribute === TAG_PROPERTIES.CSS_TEXT))
        .reduce((string, attribute) => {
            const attr = typeof tag[attribute] === "undefined"
                ? attribute
                : `${attribute}="${encodeSpecialCharacters(tag[attribute], encode)}"`;
            return string ? `${string} ${attr}` : attr;
        }, "");

    const tagContent = tag.innerHTML || tag.cssText || "";

    const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;

    return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${isSelfClosing ? `/>` : `>${tagContent}</${type}>`}`;
}, "");

const convertElementAttributestoReactProps = (attributes, initProps = {}) => {
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
    const props = convertElementAttributestoReactProps(attributes, initProps);

    return [React.createElement(TAG_NAMES.TITLE, props, title)];
};

const generateTagsAsReactComponent = (type, tags) => tags.map((tag, i) => {
    const mappedTag = {
        key: i,
        [HELMET_ATTRIBUTE]: true
    };

    Object.keys(tag).forEach((attribute) => {
        const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

        if (mappedAttribute === TAG_PROPERTIES.INNER_HTML || mappedAttribute === TAG_PROPERTIES.CSS_TEXT) {
            const content = tag.innerHTML || tag.cssText;
            mappedTag.dangerouslySetInnerHTML = {__html: content};
        } else {
            mappedTag[mappedAttribute] = tag[attribute];
        }
    });

    return React.createElement(type, mappedTag);
});

const getMethodsForTag = (type, tags, encode) => {
    switch (type) {
        case TAG_NAMES.TITLE:
            return {
                toComponent: () => generateTitleAsReactComponent(type, tags.title, tags.titleAttributes, encode),
                toString: () => generateTitleAsString(type, tags.title, tags.titleAttributes, encode)
            };
        case ATTRIBUTE_NAMES.BODY:
        case ATTRIBUTE_NAMES.HTML:
            return {
                toComponent: () => convertElementAttributestoReactProps(tags),
                toString: () => generateElementAttributesAsString(tags)
            };
        default:
            return {
                toComponent: () => generateTagsAsReactComponent(type, tags),
                toString: () => generateTagsAsString(type, tags, encode)
            };
    }
};

const mapStateOnServer = (states) => {
    let state = states;
    if (_.isArrayLikeObject(state)) {
        state = states[0];
    }
    const {
        baseTag,
        bodyAttributes,
        encode,
        htmlAttributes,
        linkTags,
        metaTags,
        noscriptTags,
        scriptTags,
        styleTags,
        title = "",
        titleAttributes
    } = state;
    return {
        base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
        bodyAttributes: getMethodsForTag(ATTRIBUTE_NAMES.BODY, bodyAttributes, encode),
        htmlAttributes: getMethodsForTag(ATTRIBUTE_NAMES.HTML, htmlAttributes, encode),
        link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
        meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
        noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
        script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
        style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
        title: getMethodsForTag(TAG_NAMES.TITLE, {title, titleAttributes}, encode)
    };
};

export {convertReactPropstoHtmlAttributes};
export {handleClientStateChange};
export {mapStateOnServer};
export {reducePropsToState};
export {requestIdleCallback};
export {warn};
