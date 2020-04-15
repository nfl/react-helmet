import React, { memo, FunctionComponent } from "react";
import PropTypes from "prop-types";
import isEqual from "react-fast-compare";
import { convertReactPropstoHtmlAttributes, warn } from "./HelmetUtils";
import { TAG_NAMES, VALID_TAG_NAMES } from "./HelmetConstants";
import { EncodeSpecialCharacters, Title } from "./types";
import { defaultHelmetState } from "./HelmetContext";
import { DOMMutationManager } from "./DOMMutationManager.v7";

// $FIXME: Refactor is complete when this is removed
type $FIXME = any;

function mapNestedChildrenToProps(child: $FIXME, nestedChildren: $FIXME) {
  if (!nestedChildren) {
    return null;
  }

  switch (child.type) {
    case TAG_NAMES.SCRIPT:
    case TAG_NAMES.NOSCRIPT:
      return {
        innerHTML: nestedChildren,
      };

    case TAG_NAMES.STYLE:
      return {
        cssText: nestedChildren,
      };
  }

  throw new Error(
    `<${child.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`
  );
}

function flattenArrayTypeChildren({
  child,
  arrayTypeChildren,
  newChildProps,
  nestedChildren,
}: $FIXME) {
  return {
    ...arrayTypeChildren,
    [child.type]: [
      ...(arrayTypeChildren[child.type] || []),
      {
        ...newChildProps,
        ...mapNestedChildrenToProps(child, nestedChildren),
      },
    ],
  };
}

function mapObjectTypeChildren({
  child,
  newProps,
  newChildProps,
  nestedChildren,
}: $FIXME) {
  switch (child.type) {
    case TAG_NAMES.TITLE:
      return {
        ...newProps,
        [child.type]: nestedChildren,
        titleAttributes: { ...newChildProps },
      };

    case TAG_NAMES.BODY:
      return {
        ...newProps,
        bodyAttributes: { ...newChildProps },
      };

    case TAG_NAMES.HTML:
      return {
        ...newProps,
        htmlAttributes: { ...newChildProps },
      };
  }

  return {
    ...newProps,
    [child.type]: { ...newChildProps },
  };
}

function mapArrayTypeChildrenToProps(
  arrayTypeChildren: $FIXME,
  newProps: $FIXME
) {
  let newFlattenedProps = { ...newProps };

  Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
    newFlattenedProps = {
      ...newFlattenedProps,
      [arrayChildName]: arrayTypeChildren[arrayChildName],
    };
  });

  return newFlattenedProps;
}

function warnOnInvalidChildren(child: $FIXME, nestedChildren: $FIXME) {
  if (process.env.NODE_ENV !== "production") {
    if (!VALID_TAG_NAMES.some((name: $FIXME) => child.type === name)) {
      if (typeof child.type === "function") {
        return warn(
          `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.`
        );
      }

      return warn(
        `Only elements types ${VALID_TAG_NAMES.join(
          ", "
        )} are allowed. Helmet does not support rendering <${
          child.type
        }> elements. Refer to our API for more information.`
      );
    }

    if (
      nestedChildren &&
      typeof nestedChildren !== "string" &&
      (!Array.isArray(nestedChildren) ||
        nestedChildren.some((nestedChild) => typeof nestedChild !== "string"))
    ) {
      throw new Error(
        `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`
      );
    }
  }

  return true;
}

function mapChildrenToProps(children: $FIXME, newProps: $FIXME) {
  let arrayTypeChildren = {};

  React.Children.forEach(children, (child) => {
    if (!child || !child.props) {
      return;
    }

    const { children: nestedChildren, ...childProps } = child.props;
    const newChildProps = convertReactPropstoHtmlAttributes(childProps);

    warnOnInvalidChildren(child, nestedChildren);

    switch (child.type) {
      case TAG_NAMES.LINK:
      case TAG_NAMES.META:
      case TAG_NAMES.NOSCRIPT:
      case TAG_NAMES.SCRIPT:
      case TAG_NAMES.STYLE:
        arrayTypeChildren = flattenArrayTypeChildren({
          child,
          arrayTypeChildren,
          newChildProps,
          nestedChildren,
        });
        break;

      default:
        newProps = mapObjectTypeChildren({
          child,
          newProps,
          newChildProps,
          nestedChildren,
        });
        break;
    }
  });

  newProps = mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
  return newProps;
}

type HelmetProps = Partial<{
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
  onChangeClientState: (...args: any) => void;
}>;

export const Helmet: FunctionComponent<HelmetProps> = memo(
  ({ children, ...props }) => {
    let newProps = {
      ...defaultHelmetState,
      ...props,
    };

    if (children) {
      newProps = mapChildrenToProps(children, newProps);
    }

    return <DOMMutationManager {...newProps} />;
  },
  isEqual
);

Helmet.displayName = "Helmet";

Helmet.propTypes = {
  defaultTitle: PropTypes.string,
  encodeSpecialCharacters: PropTypes.bool,
  onChangeClientState: PropTypes.func,
  titleTemplate: PropTypes.string,
};
