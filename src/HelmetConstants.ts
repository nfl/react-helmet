export const ATTRIBUTE_NAMES: Record<string, string> = {
  BODY: "bodyAttributes",
  HTML: "htmlAttributes",
  TITLE: "titleAttributes",
};

export const TAG_NAMES: Record<string, string> = {
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
};

export const VALID_TAG_NAMES: string[] = Object.keys(TAG_NAMES).map(
  (name) => TAG_NAMES[name]
);

export const TAG_PROPERTIES: Record<string, string> = {
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
};

export const REACT_TAG_MAP: Record<string, string> = {
  accesskey: "accessKey",
  charset: "charSet",
  class: "className",
  contenteditable: "contentEditable",
  contextmenu: "contextMenu",
  "http-equiv": "httpEquiv",
  itemprop: "itemProp",
  tabindex: "tabIndex",
};

export const HTML_TAG_MAP: Record<string, string> = Object.keys(
  REACT_TAG_MAP
).reduce((obj: Record<string, string>, key: string) => {
  obj[REACT_TAG_MAP[key]] = key;
  return obj;
}, {});

export const HELMET_PROPS: Record<string, string> = {
  DEFAULT_TITLE: "defaultTitle",
  DEFER: "defer",
  ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
  ON_CHANGE_CLIENT_STATE: "onChangeClientState",
  TITLE_TEMPLATE: "titleTemplate",
};

export const SELF_CLOSING_TAGS: string[] = [
  TAG_NAMES.NOSCRIPT,
  TAG_NAMES.SCRIPT,
  TAG_NAMES.STYLE,
];

export const HELMET_ATTRIBUTE: string = "data-react-helmet";
