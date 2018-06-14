import React from "react";
import objectAssign from "object-assign";
import domInsert from 'dom-insert';

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

const getTitleFromPropsList = propsList => {
    const innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
    const innermostTemplate = getInnermostProperty(
        propsList,
        HELMET_PROPS.TITLE_TEMPLATE
    );

    if (innermostTemplate && innermostTitle) {
        // use function arg to avoid need to escape $ characters
        return innermostTemplate.replace(
            /%s/g,
            () =>
                Array.isArray(innermostTitle)
                    ? innermostTitle.join("")
                    : innermostTitle
        );
    }

    const innermostDefaultTitle = getInnermostProperty(
        propsList,
        HELMET_PROPS.DEFAULT_TITLE
    );

    return innermostTitle || innermostDefaultTitle || undefined;
};

const getOnChangeClientState = propsList => {
    return (
        getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) ||
        (() => {})
    );
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

                    if (
                        primaryAttributes.indexOf(lowerCaseAttributeKey) !==
                            -1 &&
                        tag[lowerCaseAttributeKey]
                    ) {
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
        .filter(props => {
            if (Array.isArray(props[tagName])) {
                return true;
            }
            if (typeof props[tagName] !== "undefined") {
                warn(
                    `Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[
                        tagName
                    ]}"`
                );
            }
            return false;
        })
        .map(props => props[tagName])
        .reverse()
        .reduce((approvedTags, instanceTags) => {
            const instanceSeenTags = {};

            instanceTags
                .filter(tag => {
                    let primaryAttributeKey;
                    const keys = Object.keys(tag);
                    for (let i = 0; i < keys.length; i++) {
                        const attributeKey = keys[i];
                        const lowerCaseAttributeKey = attributeKey.toLowerCase();

                        // Special rule with link tags, since rel and href are both primary tags, rel takes priority
                        if (
                            primaryAttributes.indexOf(lowerCaseAttributeKey) !==
                                -1 &&
                            !(
                                primaryAttributeKey === TAG_PROPERTIES.REL &&
                                tag[primaryAttributeKey].toLowerCase() ===
                                    "canonical"
                            ) &&
                            !(
                                lowerCaseAttributeKey === TAG_PROPERTIES.REL &&
                                tag[lowerCaseAttributeKey].toLowerCase() ===
                                    "stylesheet"
                            )
                        ) {
                            primaryAttributeKey = lowerCaseAttributeKey;
                        }
                        // Special case for innerHTML which doesn't work lowercased
                        if (
                            primaryAttributes.indexOf(attributeKey) !== -1 &&
                            (attributeKey === TAG_PROPERTIES.INNER_HTML ||
                                attributeKey === TAG_PROPERTIES.CSS_TEXT ||
                                attributeKey === TAG_PROPERTIES.ITEM_PROP)
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

const reducePropsToState = propsList => ({
    baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF], propsList),
    bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
    defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
    encode: getInnermostProperty(
        propsList,
        HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS
    ),
    htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
    linkTags: getTagsFromPropsList(
        TAG_NAMES.LINK,
        [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF],
        propsList
    ),
    metaTags: getTagsFromPropsList(
        TAG_NAMES.META,
        [
            TAG_PROPERTIES.NAME,
            TAG_PROPERTIES.CHARSET,
            TAG_PROPERTIES.HTTPEQUIV,
            TAG_PROPERTIES.PROPERTY,
            TAG_PROPERTIES.ITEM_PROP
        ],
        propsList
    ),
    noscriptTags: getTagsFromPropsList(
        TAG_NAMES.NOSCRIPT,
        [TAG_PROPERTIES.INNER_HTML],
        propsList
    ),
    onChangeClientState: getOnChangeClientState(propsList),
    scriptTags: getTagsFromPropsList(
        TAG_NAMES.SCRIPT,
        [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML],
        propsList
    ),
    styleTags: getTagsFromPropsList(
        TAG_NAMES.STYLE,
        [TAG_PROPERTIES.CSS_TEXT],
        propsList
    ),
    title: getTitleFromPropsList(propsList),
    titleAttributes: getAttributesFromPropsList(
        ATTRIBUTE_NAMES.TITLE,
        propsList
    )
});

const rafPolyfill = (() => {
    let clock = Date.now();

    return (callback: Function) => {
        const currentTime = Date.now();

        if (currentTime - clock > 16) {
            clock = currentTime;
            callback(currentTime);
        } else {
            setTimeout(() => {
                rafPolyfill(callback);
            }, 0);
        }
    };
})();

const cafPolyfill = (id: string | number) => clearTimeout(id);

const requestAnimationFrame = typeof window !== "undefined"
    ? window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          rafPolyfill
    : global.requestAnimationFrame || rafPolyfill;

const cancelAnimationFrame = typeof window !== "undefined"
    ? window.cancelAnimationFrame ||
          window.webkitCancelAnimationFrame ||
          window.mozCancelAnimationFrame ||
          cafPolyfill
    : global.cancelAnimationFrame || cafPolyfill;

const warn = msg => {
    return console && typeof console.warn === "function" && console.warn(msg);
};

let _helmetCallback = null;

const handleClientStateChange = newState => {
    if (_helmetCallback) {
        cancelAnimationFrame(_helmetCallback);
    }

    if (newState.defer) {
        _helmetCallback = requestAnimationFrame(() => {
            commitTagChanges(newState, () => {
                _helmetCallback = null;
            });
        });
    } else {
        commitTagChanges(newState);
        _helmetCallback = null;
    }
};

const commitTagChanges = (newState, cb) => {
    const {
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
    updateAttributes(TAG_NAMES.BODY, bodyAttributes);
    updateAttributes(TAG_NAMES.HTML, htmlAttributes);

    updateTitle(title, titleAttributes);

    const tagUpdates = {
        baseTag: updateTags(TAG_NAMES.BASE, baseTag),
        linkTags: updateTags(TAG_NAMES.LINK, linkTags),
        metaTags: updateTags(TAG_NAMES.META, metaTags),
        noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
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

    cb && cb();

    onChangeClientState(newState, addedTags, removedTags);
};

const flattenArray = possibleArray => {
    return Array.isArray(possibleArray)
        ? possibleArray.join("")
        : possibleArray;
};

const updateTitle = (title, attributes) => {
    if (typeof title !== "undefined" && document.title !== title) {
        document.title = flattenArray(title);
    }

    updateAttributes(TAG_NAMES.TITLE, attributes);
};

const updateAttributes = (tagName, attributes) => {
    const elementTag = document.getElementsByTagName(tagName)[0];

    if (!elementTag) {
        return;
    }

    const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
    const helmetAttributes = helmetAttributeString
        ? helmetAttributeString.split(",")
        : [];
    const attributesToRemove = [].concat(helmetAttributes);
    const attributeKeys = Object.keys(attributes);

    for (let i = 0; i < attributeKeys.length; i++) {
        const attribute = attributeKeys[i];
        const value = attributes[attribute] || "";

        if (elementTag.getAttribute(attribute) !== value) {
            elementTag.setAttribute(attribute, value);
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
    } else if (
        elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")
    ) {
        elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
    }
};

const updateTags = (type, tags) => {
    const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
    const tagNodes = headElement.querySelectorAll(
        `${type}[${HELMET_ATTRIBUTE}]`
    );
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
                            newElement.appendChild(
                                document.createTextNode(tag.cssText)
                            );
                        }
                    } else {
                        const value = typeof tag[attribute] === "undefined"
                            ? ""
                            : tag[attribute];
                        newElement.setAttribute(attribute, value);
                    }
                }
            }

            newElement.setAttribute(HELMET_ATTRIBUTE, "true");

            // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
            if (
                oldTags.some((existingTag, index) => {
                    indexToDelete = index;
                    return newElement.isEqualNode(existingTag);
                })
            ) {
                oldTags.splice(indexToDelete, 1);
            } else {
                newTags.push(newElement);
            }
        });
    }

    oldTags.forEach(tag => tag.parentNode.removeChild(tag));
    newTags.forEach(tag => {
        domInsert.prepend(headElement, tag);
    });

    return {
        oldTags,
        newTags
    };
};

const generateElementAttributesAsString = attributes =>
    Object.keys(attributes).reduce((str, key) => {
        const attr = typeof attributes[key] !== "undefined"
            ? `${key}="${attributes[key]}"`
            : `${key}`;
        return str ? `${str} ${attr}` : attr;
    }, "");

const generateTitleAsString = (type, title, attributes, encode) => {
    const attributeString = generateElementAttributesAsString(attributes);
    const flattenedTitle = flattenArray(title);
    return attributeString
        ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(
              flattenedTitle,
              encode
          )}</${type}>`
        : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(
              flattenedTitle,
              encode
          )}</${type}>`;
};

const generateTagsAsString = (type, tags, encode) =>
    tags.reduce((str, tag) => {
        const attributeHtml = Object.keys(tag)
            .filter(
                attribute =>
                    !(
                        attribute === TAG_PROPERTIES.INNER_HTML ||
                        attribute === TAG_PROPERTIES.CSS_TEXT
                    )
            )
            .reduce((string, attribute) => {
                const attr = typeof tag[attribute] === "undefined"
                    ? attribute
                    : `${attribute}="${encodeSpecialCharacters(
                          tag[attribute],
                          encode
                      )}"`;
                return string ? `${string} ${attr}` : attr;
            }, "");

        const tagContent = tag.innerHTML || tag.cssText || "";

        const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;

        return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${isSelfClosing
            ? `/>`
            : `>${tagContent}</${type}>`}`;
    }, "");

const convertElementAttributestoReactProps = (attributes, initProps = {}) => {
    return Object.keys(attributes).reduce((obj, key) => {
        obj[REACT_TAG_MAP[key] || key] = attributes[key];
        return obj;
    }, initProps);
};

const convertReactPropstoHtmlAttributes = (props, initAttributes = {}) => {
    return Object.keys(props).reduce((obj, key) => {
        obj[HTML_TAG_MAP[key] || key] = props[key];
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

const generateTagsAsReactComponent = (type, tags) =>
    tags.map((tag, i) => {
        const mappedTag = {
            key: i,
            [HELMET_ATTRIBUTE]: true
        };

        Object.keys(tag).forEach(attribute => {
            const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

            if (
                mappedAttribute === TAG_PROPERTIES.INNER_HTML ||
                mappedAttribute === TAG_PROPERTIES.CSS_TEXT
            ) {
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
                toComponent: () =>
                    generateTitleAsReactComponent(
                        type,
                        tags.title,
                        tags.titleAttributes,
                        encode
                    ),
                toString: () =>
                    generateTitleAsString(
                        type,
                        tags.title,
                        tags.titleAttributes,
                        encode
                    )
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

const mapStateOnServer = ({
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
}) => ({
    base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
    bodyAttributes: getMethodsForTag(
        ATTRIBUTE_NAMES.BODY,
        bodyAttributes,
        encode
    ),
    htmlAttributes: getMethodsForTag(
        ATTRIBUTE_NAMES.HTML,
        htmlAttributes,
        encode
    ),
    link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
    meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
    noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
    script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
    style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
    title: getMethodsForTag(TAG_NAMES.TITLE, {title, titleAttributes}, encode)
});

export {convertReactPropstoHtmlAttributes};
export {handleClientStateChange};
export {mapStateOnServer};
export {reducePropsToState};
export {requestAnimationFrame};
export {warn};
