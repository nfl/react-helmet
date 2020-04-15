export const getObjectKeys = <O extends object>(obj: O) =>
  Object.keys(obj) as Array<keyof O>;

export const ATTRIBUTE_NAMES = {
  BODY: "bodyAttributes",
  HTML: "htmlAttributes",
  TITLE: "titleAttributes",
} as const;

export type HTMLAttributeNames = typeof ATTRIBUTE_NAMES[keyof typeof ATTRIBUTE_NAMES];

export const TAG_NAMES = {
  BASE: "base",
  BODY: "body",
  HEAD: "head",
  HTML: "html",
  LINK: "link",
  META: "meta",
  NOSCRIPT: "noscript",
  SCRIPT: "script",
  STYLE: "style",
  TITLE: "title",
} as const;

export const VALID_TAG_NAMES = Object.values(TAG_NAMES);
export type HTMLTagNames = typeof VALID_TAG_NAMES[number];

export type ArrayTypeChildSubset = Extract<
  keyof typeof TAG_NAMES,
  "LINK" | "META" | "NOSCRIPT" | "SCRIPT" | "STYLE"
>;
export type ArrayTypeChildValues = typeof TAG_NAMES[ArrayTypeChildSubset];
export type ArrayTypeChildren = Partial<Record<ArrayTypeChildValues, any>>;

export const TAG_PROPERTIES = {
  CHARSET: "charset",
  CSS_TEXT: "cssText",
  HREF: "href",
  HTTPEQUIV: "http-equiv",
  INNER_HTML: "innerHTML",
  ITEM_PROP: "itemprop",
  NAME: "name",
  PROPERTY: "property",
  REL: "rel",
  SRC: "src",
  TARGET: "target",
} as const;

export type HTMLTagProperties = typeof TAG_PROPERTIES[keyof typeof TAG_PROPERTIES];

export const REACT_TAG_MAP = {
  accesskey: "accessKey",
  charset: "charSet",
  class: "className",
  contenteditable: "contentEditable",
  contextmenu: "contextMenu",
  "http-equiv": "httpEquiv",
  itemprop: "itemProp",
  tabindex: "tabIndex",
} as const;

export type ReactTagMapKeys = keyof typeof REACT_TAG_MAP;
export type ReactTagMapValues = typeof REACT_TAG_MAP[ReactTagMapKeys];

const VALID_HTML_TAGS = getObjectKeys(REACT_TAG_MAP);

export const HELMET_PROPS = {
  DEFAULT_TITLE: "defaultTitle",
  DEFER: "defer",
  ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
  ON_CHANGE_CLIENT_STATE: "onChangeClientState",
  TITLE_TEMPLATE: "titleTemplate",
} as const;

type HtmlTagMap = Record<ReactTagMapValues, ReactTagMapKeys>;

export const HTML_TAG_MAP = VALID_HTML_TAGS.reduce((obj, key) => {
  obj[REACT_TAG_MAP[key]] = key;
  return obj;
}, {} as HtmlTagMap);

export const SELF_CLOSING_TAGS = [
  TAG_NAMES.NOSCRIPT,
  TAG_NAMES.SCRIPT,
  TAG_NAMES.STYLE,
] as const;

export const HELMET_ATTRIBUTE = "data-react-helmet" as const;
