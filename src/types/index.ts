import { ReactTagMapKeys } from "../HelmetConstants";

// $FIXME: Refactor is complete when this is removed
export type $FIXME = any;

export type Title = string;
export type EncodeSpecialCharacters = boolean;

export type HelmetServerState<
  T extends HelmetPropsListItem = HelmetPropsListItem
> = Required<{
  readonly baseTag: Required<T>["base"];
  readonly bodyAttributes: Required<T>["bodyAttributes"];
  readonly defer: Required<T>["defer"];
  readonly encode: Required<T>["encodeSpecialCharacters"];
  readonly htmlAttributes: Required<T>["htmlAttributes"];
  readonly linkTags: Required<T>["link"];
  readonly metaTags: Required<T>["meta"];
  readonly noscriptTags: Required<T>["noscript"];
  readonly onChangeClientState?: T["onChangeClientState"];
  readonly scriptTags: Required<T>["script"];
  readonly styleTags: Required<T>["style"];
  readonly title: Required<T>["title"];
  readonly titleAttributes: Required<T>["titleAttributes"];
}>;

export type HelmetServerTags =
  | HelmetServerState["baseTag"]
  | HelmetServerState["linkTags"]
  | HelmetServerState["metaTags"]
  | HelmetServerState["noscriptTags"]
  | HelmetServerState["scriptTags"]
  | HelmetServerState["styleTags"];

export type HelmetProps = Partial<{
  /**
   * @example <Helmet defer={false} />
   */
  defer: boolean;
  /**
   * @example <Helmet encodeSpecialCharacters />
   */
  encodeSpecialCharacters: EncodeSpecialCharacters;
  /**
   * @example <Helmet titleTemplate="MySite.com - %s" />
   */
  titleTemplate: Title;
  /**
   * @example <Helmet defaultTitle="Default Title" />
   */
  defaultTitle: Title;
  /**
   * @example <Helmet onChangeClientState={(newState) => console.log(newState)} />
   */
  onChangeClientState: (
    newState: HelmetServerState,
    addedTags: $FIXME,
    removedTags: $FIXME
  ) => {};
}>;

export type HelmetNoScriptElement = {
  innerHTML: string;
};

export type HelmetAttributeMap = Record<ReactTagMapKeys | string, string>;

export type HelmetPropsListItem = HelmetProps &
  Partial<{
    base: HelmetAttributeMap[];
    bodyAttributes: HelmetAttributeMap;
    // defaultTitle: Title;
    // defer: boolean;
    // encodeSpecialCharacters: EncodeSpecialCharacters;
    htmlAttributes: HelmetAttributeMap;
    link: HelmetAttributeMap[];
    meta: HelmetAttributeMap[];
    noscript: HelmetAttributeMap[];
    // onChangeClientState: (...args: any) => void;
    script: HelmetAttributeMap[];
    style: HelmetAttributeMap[];
    title: Title | Title[];
    titleAttributes: HelmetAttributeMap;
    // titleTemplate: Title;
    // [type: string]: ReactNode
  }>;
