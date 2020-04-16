import React, { memo, FunctionComponent, ReactNode, ReactElement } from "react";
import PropTypes from "prop-types";
import isEqual from "react-fast-compare";
import { convertReactPropstoHtmlAttributes, warn } from "./HelmetUtils";
import {
  ArrayTypeChildValues,
  ArrayTypeChildren,
  TAG_NAMES,
  VALID_TAG_NAMES,
  getObjectKeys,
} from "./HelmetConstants";
import { HelmetPropsListItem, HelmetProps } from "./types";
import { DOMMutationManager } from "./DOMMutationManager.v7";

function mapNestedChildrenToProps(child: ReactElement, nestedChildren: string) {
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
}: {
  child: ReactElement<unknown, ArrayTypeChildValues>;
  arrayTypeChildren: ArrayTypeChildren;
  newChildProps: ReactElement["props"];
  nestedChildren: string;
}) {
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
}: {
  child: ReactElement;
  newProps: HelmetPropsListItem;
  newChildProps: ReactElement["props"];
  nestedChildren: string;
}) {
  if (typeof child.type !== "string") {
    return { ...newProps };
  }

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
  arrayTypeChildren: ArrayTypeChildren,
  newProps: HelmetPropsListItem
) {
  let newFlattenedProps = { ...newProps };

  getObjectKeys(arrayTypeChildren).forEach((arrayChildName) => {
    newFlattenedProps = {
      ...newFlattenedProps,
      [arrayChildName]: arrayTypeChildren[arrayChildName],
    };
  });

  return newFlattenedProps;
}

function warnOnInvalidChildren(child: ReactElement, nestedChildren: ReactNode) {
  if (process.env.NODE_ENV !== "production") {
    if (!VALID_TAG_NAMES.some((name) => child.type === name)) {
      if (typeof child.type === "function") {
        return warn(
          `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.`
        );
      }

      return warn(
        `Only elements of type ${VALID_TAG_NAMES.join(
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

function isReactElement(
  child: ReactNode | null | undefined
): child is ReactElement {
  return !!child && (child as ReactElement).props;
}

function isArrayTypeChild(
  child: ReactElement
): child is ReactElement<unknown, ArrayTypeChildValues> {
  switch (child.type) {
    case TAG_NAMES.LINK:
    case TAG_NAMES.META:
    case TAG_NAMES.NOSCRIPT:
    case TAG_NAMES.SCRIPT:
    case TAG_NAMES.STYLE:
      return true;

    default:
      return false;
  }
}

function mapChildrenToProps(
  children: ReactNode,
  newProps: HelmetPropsListItem
) {
  let arrayTypeChildren: ArrayTypeChildren = {};

  React.Children.forEach(children, (child) => {
    if (!isReactElement(child)) {
      return;
    }

    const { children: nestedChildren, ...childProps } = child.props;
    const newChildProps = convertReactPropstoHtmlAttributes(childProps);

    warnOnInvalidChildren(child, nestedChildren);

    if (isArrayTypeChild(child)) {
      arrayTypeChildren = flattenArrayTypeChildren({
        child,
        arrayTypeChildren,
        newChildProps,
        nestedChildren,
      });
    } else {
      newProps = mapObjectTypeChildren({
        child,
        newProps,
        newChildProps,
        nestedChildren,
      });
    }
  });

  newProps = mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
  return newProps;
}

const defaultHelmetProps = {
  defer: false,
  encodeSpecialCharacters: true,
};

export const Helmet: FunctionComponent<HelmetProps> = memo(
  ({ children, ...props }) => {
    let newProps: HelmetPropsListItem = {
      ...defaultHelmetProps,
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
  defer: PropTypes.bool,
  defaultTitle: PropTypes.string,
  encodeSpecialCharacters: PropTypes.bool,
  onChangeClientState: PropTypes.func,
  titleTemplate: PropTypes.string,
};
