import React, { ReactElement } from "react";
import objectAssign from "object-assign";
import {
  ATTRIBUTE_NAMES,
  HELMET_ATTRIBUTE,
  HELMET_PROPS,
  HTML_TAG_MAP,
  REACT_TAG_MAP,
  SELF_CLOSING_TAGS,
  TAG_NAMES,
  TAG_PROPERTIES,
  ReactTagMapKeys,
  ReactTagMapValues,
  HTMLTagNames,
  HTMLTagProperties,
  HTMLAttributeNames,
  ArrayTypeChildValues,
  getObjectKeys,
} from "./HelmetConstants";

import {
  HelmetServerState,
  HelmetPropsListItem,
  Title,
  EncodeSpecialCharacters,
  HelmetAttributeMap,
  HelmetServerTags,
  $FIXME,
} from "./types";

const encodeSpecialCharacters = (str: string, encode = true) => {
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

const getTitleFromPropsList = (propsList: HelmetPropsListItem[]) => {
  const innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
  const innermostTemplate = getInnermostProperty(
    propsList,
    HELMET_PROPS.TITLE_TEMPLATE
  );

  if (innermostTemplate && innermostTitle) {
    // use function arg to avoid need to escape $ characters
    return innermostTemplate.replace(/%s/g, () =>
      Array.isArray(innermostTitle) ? innermostTitle.join("") : innermostTitle
    );
  }

  const innermostDefaultTitle = getInnermostProperty(
    propsList,
    HELMET_PROPS.DEFAULT_TITLE
  );

  return innermostTitle || innermostDefaultTitle || undefined;
};

const getOnChangeClientState = (propsList: HelmetPropsListItem[]) => {
  return (
    getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) ||
    (() => {})
  );
};

const getAttributesFromPropsList = (
  tagType: HTMLAttributeNames,
  propsList: HelmetPropsListItem[]
) => {
  return propsList
    .filter((props) => typeof props[tagType] !== "undefined")
    .map((props) => props[tagType])
    .reduce((tagAttrs, current) => {
      return { ...tagAttrs, ...current };
    }, {} as HelmetAttributeMap);
};

const getBaseTagFromPropsList = (
  primaryAttributes: HTMLTagProperties[],
  propsList: HelmetPropsListItem[]
) => {
  return propsList
    .filter((props) => typeof props[TAG_NAMES.BASE] !== "undefined")
    .map((props) => props[TAG_NAMES.BASE])
    .reverse()
    .reduce((innermostBaseTag, tag: $FIXME) => {
      if (!innermostBaseTag.length) {
        const keys = getObjectKeys(tag);

        for (let i = 0; i < keys.length; i++) {
          const attributeKey: $FIXME = keys[i];
          const lowerCaseAttributeKey = attributeKey.toLowerCase();

          if (
            primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
            tag[lowerCaseAttributeKey]
          ) {
            return innermostBaseTag.concat(tag);
          }
        }
      }

      return innermostBaseTag;
    }, [] as HelmetPropsListItem[]);
};

const getTagsFromPropsList = <TagName extends ArrayTypeChildValues>(
  tagName: TagName,
  primaryAttributes: HTMLTagProperties[],
  propsList: HelmetPropsListItem[]
) => {
  // Calculate list of tags, giving priority innermost component (end of the propslist)
  const approvedSeenTags: $FIXME = {};

  return propsList
    .filter((props) => {
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
    .map((props) => props[tagName])
    .reverse()
    .reduce((approvedTags, instanceTags = []) => {
      const instanceSeenTags: $FIXME = {};

      instanceTags
        .filter((tag) => {
          let primaryAttributeKey;
          const keys = getObjectKeys(tag);
          for (let i = 0; i < keys.length; i++) {
            const attributeKey: $FIXME = keys[i];
            const lowerCaseAttributeKey: $FIXME = attributeKey.toLowerCase() as typeof attributeKey;

            // Special rule with link tags, since rel and href are both primary tags, rel takes priority
            if (
              primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 &&
              !(
                primaryAttributeKey &&
                primaryAttributeKey === TAG_PROPERTIES.REL &&
                tag[primaryAttributeKey] &&
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
        .forEach((tag) => approvedTags.push(tag));

      // Update seen tags with tags from this instance
      const keys = getObjectKeys(instanceSeenTags);
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
    }, [] as HelmetPropsListItem[])
    .reverse();
};

const getInnermostProperty = <P extends keyof HelmetPropsListItem>(
  propsList: HelmetPropsListItem[],
  property: P
) => {
  for (let i = propsList.length - 1; i >= 0; i--) {
    const props = propsList[i];

    if (props.hasOwnProperty(property)) {
      return props[property];
    }
  }

  return null;
};

const reducePropsToState = (propsList: HelmetPropsListItem[]): $FIXME => ({
  baseTag: getBaseTagFromPropsList(
    [TAG_PROPERTIES.HREF, TAG_PROPERTIES.TARGET],
    propsList
  ),
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
      TAG_PROPERTIES.ITEM_PROP,
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
  titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, propsList),
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

const cafPolyfill = (id: number) => clearTimeout(id);

const requestAnimationFrame =
  typeof window !== "undefined"
    ? (window.requestAnimationFrame &&
        window.requestAnimationFrame.bind(window)) ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      rafPolyfill
    : global.requestAnimationFrame || rafPolyfill;

const cancelAnimationFrame =
  typeof window !== "undefined"
    ? window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      cafPolyfill
    : global.cancelAnimationFrame || cafPolyfill;

const warn = (...args: Parameters<typeof console.warn>) => {
  return console && typeof console.warn === "function" && console.warn(...args);
};

let _helmetCallback: ReturnType<typeof requestAnimationFrame> | null = null;

const handleClientStateChange = (newState: HelmetServerState) => {
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

const commitTagChanges = (newState: HelmetServerState, cb?: () => void) => {
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
    titleAttributes,
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
    styleTags: updateTags(TAG_NAMES.STYLE, styleTags),
  };

  const addedTags: $FIXME = {};
  const removedTags: $FIXME = {};

  getObjectKeys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType];

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

const flattenTitleArray = (possibleArray: Title | Title[]): Title => {
  return Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
};

const updateTitle = (
  title: Title | Title[],
  attributes: HelmetAttributeMap
) => {
  if (typeof title !== "undefined" && document.title !== title) {
    document.title = flattenTitleArray(title);
  }

  updateAttributes(TAG_NAMES.TITLE, attributes);
};

const updateAttributes = (
  tagName: HTMLTagNames,
  attributes: HelmetAttributeMap
) => {
  const elementTag = document.getElementsByTagName(tagName)[0];

  if (!elementTag) {
    return;
  }

  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString
    ? helmetAttributeString.split(",")
    : [];
  const attributesToRemove = [...helmetAttributes];
  const attributeKeys = getObjectKeys(attributes);

  for (let i = 0; i < attributeKeys.length; i++) {
    const attribute = attributeKeys[i];
    const value = attributes[attribute] || "";

    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, String(value));
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

const updateTags = (type: HTMLTagNames, tags: HelmetServerTags) => {
  const headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
  const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags = Array.prototype.slice.call(tagNodes);
  const newTags: HTMLElement[] = [];
  let indexToDelete: number;

  if (tags && tags.length) {
    tags.forEach((tag) => {
      const newElement = document.createElement(type);

      for (const attribute in tag) {
        if (tag.hasOwnProperty(attribute)) {
          if (attribute === TAG_PROPERTIES.INNER_HTML) {
            newElement.innerHTML = tag.innerHTML;
          } else if (attribute === TAG_PROPERTIES.CSS_TEXT) {
            if ((newElement as $FIXME).styleSheet) {
              (newElement as $FIXME).styleSheet.cssText = tag.cssText;
            } else {
              newElement.appendChild(document.createTextNode(tag.cssText));
            }
          } else {
            const value =
              typeof tag[attribute] === "undefined" ? "" : tag[attribute];
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

  oldTags.forEach((tag) => tag.parentNode.removeChild(tag));
  newTags.forEach((tag) => headElement.appendChild(tag));

  return {
    oldTags,
    newTags,
  };
};

const generateElementAttributesAsString = (attributes: HelmetAttributeMap) =>
  getObjectKeys(attributes).reduce((str, key) => {
    const attr =
      typeof attributes[key] !== "undefined"
        ? `${key}="${attributes[key]}"`
        : `${key}`;
    return str ? `${str} ${attr}` : attr;
  }, "");

const generateTitleAsString = (
  type: Extract<HTMLTagNames, "title">,
  title: HelmetServerState["title"],
  attributes: HelmetServerState["titleAttributes"],
  encode: EncodeSpecialCharacters
) => {
  const attributeString = generateElementAttributesAsString(attributes);
  const flattenedTitle = flattenTitleArray(title);
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

const generateTagsAsString = (
  type: HTMLTagNames,
  tags: HelmetServerTags,
  encode: EncodeSpecialCharacters
) =>
  tags.reduce((str, tag) => {
    const attributeHtml = getObjectKeys(tag)
      .filter(
        (attribute) =>
          !(
            attribute === TAG_PROPERTIES.INNER_HTML ||
            attribute === TAG_PROPERTIES.CSS_TEXT
          )
      )
      .reduce((string, attribute) => {
        const attr =
          typeof tag[attribute] === "undefined"
            ? attribute
            : `${attribute}="${encodeSpecialCharacters(
                tag[attribute],
                encode
              )}"`;
        return string ? `${string} ${attr}` : attr;
      }, "");

    const tagContent = tag.innerHTML || tag.cssText || "";

    const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type as $FIXME) === -1;

    return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${
      isSelfClosing ? `/>` : `>${tagContent}</${type}>`
    }`;
  }, "");

const convertElementAttributestoReactProps = (
  attributes: HelmetAttributeMap,
  initProps = {}
) => {
  return (getObjectKeys(attributes) as ReactTagMapKeys[]).reduce((obj, key) => {
    obj[REACT_TAG_MAP[key] || key] = attributes[key];
    return obj;
  }, initProps as typeof attributes);
};

const convertReactPropstoHtmlAttributes = (
  props: ReactElement["props"],
  initAttributes: ReactElement["props"] = {}
) => {
  return (getObjectKeys(props) as ReactTagMapValues[]).reduce((obj, key) => {
    obj[HTML_TAG_MAP[key] || key] = props[key];
    return obj;
  }, initAttributes);
};

const generateTitleAsReactComponent = (
  title: HelmetServerState["title"],
  attributes: HelmetServerState["titleAttributes"]
) => {
  // assigning into an array to define toString function on it
  const initProps = {
    key: title,
    [HELMET_ATTRIBUTE]: true,
  };
  const props = convertElementAttributestoReactProps(attributes, initProps);

  return [React.createElement(TAG_NAMES.TITLE, props, title)];
};

const generateTagAsReactComponent = <
  Type extends HTMLTagNames = HTMLTagNames,
  Tag extends HelmetAttributeMap = HelmetAttributeMap
>(
  type: Type,
  tag: Tag,
  key: number
) => {
  const mappedTag: {
    dangerouslySetInnerHTML?: { __html: string };
    key: number;
    [HELMET_ATTRIBUTE]: boolean;
    [key: string]: unknown;
  } = {
    key,
    [HELMET_ATTRIBUTE]: true,
  };

  getObjectKeys(tag).forEach((attribute) => {
    const mappedAttribute =
      REACT_TAG_MAP[attribute as ReactTagMapKeys] || attribute;

    if (
      attribute === TAG_PROPERTIES.INNER_HTML ||
      attribute === TAG_PROPERTIES.CSS_TEXT
    ) {
      const content = tag.innerHTML || tag.cssText;
      mappedTag.dangerouslySetInnerHTML = { __html: content };
    } else {
      mappedTag[mappedAttribute] = tag[attribute];
    }
  });

  return React.createElement(type, mappedTag);
};

const generateTagsAsReactComponent = <
  Type extends HTMLTagNames = HTMLTagNames,
  Tags extends HelmetServerTags = HelmetServerTags
>(
  type: Type,
  tags: Tags
) => {
  return tags.map((tag, key) => {
    return generateTagAsReactComponent(type, tag, key);
  });
};

const getMethodsForTag = (
  type: HTMLTagNames,
  tags: HelmetServerTags,
  encode: EncodeSpecialCharacters
) => ({
  toComponent: () => generateTagsAsReactComponent(type, tags),
  toString: () => generateTagsAsString(type, tags, encode),
});

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
  titleAttributes,
}: HelmetServerState<HelmetPropsListItem>) => ({
  base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
  bodyAttributes: {
    toComponent: () => convertElementAttributestoReactProps(bodyAttributes),
    toString: () => generateElementAttributesAsString(bodyAttributes),
  },
  htmlAttributes: {
    toComponent: () => convertElementAttributestoReactProps(htmlAttributes),
    toString: () => generateElementAttributesAsString(htmlAttributes),
  },
  link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
  meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
  noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
  script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
  style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
  title: {
    toComponent: () => generateTitleAsReactComponent(title, titleAttributes),
    toString: () =>
      generateTitleAsString(TAG_NAMES.TITLE, title, titleAttributes, encode),
  },
});

export { convertReactPropstoHtmlAttributes };
export { handleClientStateChange };
export { mapStateOnServer };
export { reducePropsToState };
export { requestAnimationFrame };
export { warn };
