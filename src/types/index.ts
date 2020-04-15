type BaseTag = {
  readonly target: string;
  readonly href: string;
};

type BodyAttributes = {
  readonly className: string;
};

export type Title = string;

type HelmetAttributes<T> = Record<string, T>;

type TitleAttributes = HelmetAttributes<string>;
type HtmlAttributes = HelmetAttributes<string>;

type LinkTag = {
  readonly rel: string;
  readonly href: string;
};

type MetaTag = {
  readonly name: string;
  readonly content: string;
};

type NoScriptTag = {
  readonly innerHTML: string;
};

type ScriptTag = {
  readonly type: string;
  readonly src: string;
};

type StyleTag = {
  readonly type: "text/css";
  readonly cssText: string;
};

// type Defer = boolean
export type EncodeSpecialCharacters = boolean;

export type HelmetServerState = {
  readonly baseTag: BaseTag;
  readonly bodyAttributes: BodyAttributes;
  //   readonly defer: Defer;
  readonly encodeSpecialCharacters: EncodeSpecialCharacters;
  readonly htmlAttributes: HtmlAttributes;
  readonly linkTags: LinkTag[];
  readonly metaTags: MetaTag[];
  readonly noscriptTags: NoScriptTag[];
  //   readonly onChangeClientState: (newState: $FIXME) => {};
  readonly scriptTags: ScriptTag[];
  readonly styleTags: StyleTag[];
  readonly title: Title;
  readonly titleAttributes: TitleAttributes;
  //   readonly titleTemplate: TitleTemplate;
};
