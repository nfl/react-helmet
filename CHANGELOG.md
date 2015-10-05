<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [2.0.0](#200)
- [1.1.5](#115)
- [1.1.4](#114)
- [1.1.3](#113)
- [1.1.2](#112)
- [1.1.1](#111)
- [1.1.0](#110)
- [1.0.1](#101)
- [1.0.0](#100)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 2.0.0

Features:

  - Base tag support.
  - Script tag support.
  - All head attributes (title / base / meta / link / script) returned as React components on the server with toString() support

Bugfixes:

  - Removed ability to nest children in Helmet.
  - Decorated component from react-side-effect, now wrapped by Helmet in order to enforce deep equal check on shouldComponentUpdate. This will limit unnecessary DOM changes and rendering.
  - Bump dependencies

## 1.1.5

Bugfixes:

  - Adding webpack under devDependencies, as it's no longer automatically installed as a peer dependency
  - Bump dependencies

## 1.1.4

Bugfixes:

  - Bumping to react-side-effect 1.0.2
  - Updating peer dependences for react 0.14.0-rc1
  - Bump dependencies

## 1.1.3

Bugfixes:

  - Externalize react-side-effect
  - shouldComponentUpdate compares props with deep equal
  - handleClientStateChange compares DOM changes with deep equal to prevent unnecessary DOM changes
  - Warning users to not nest children in their Helmet components.  We found that when Helmet contains children, those children are part of the props that are compared in shouldComponentUpdate.  And this causes unnecessary renders as the props are always different, even with the same Helmet title/meta/link props.
  - Adding react-helmet-example to README
  - Bumping to react-side-effect 1.0.1
  - Bump dependencies.

## 1.1.2

Bugfixes:

  - Use named exports in HelmetConstants
  - Allow all React 0.14 betas in peer dependencies
  - Bump dependencies.
  - Fixed invariant check in CreateSideEffect

## 1.1.1

Bugfixes:

  - Externalizing of React helpers - exenv, invariant, shallowequal
  - Using ES6 collections to manage tags
  - Bumping peer dependency for use in React 0.14.0-beta.
  - Title encoded when being rendered on the server
  - Import a smaller subset of core-js modules instead of the whole shim.

## 1.1.0

Features:

  - titleTemplate attribute to help format `document.title`

Bugfixes:

  - Bump dependencies.
  - Title will never be overwritten with blank title.  Lifts constraint where every component with Helmet needed to define a title.
  - Re-organization of unit tests.

## 1.0.1

Bugfixes:

  - Bump dependencies
  - rewind() saves title/meta/link values before disposing
  - Typo in README - use Helmet.rewind()
  - "he" package added to dependencies
  - Added Travis CI integration
  - npm requirement removed - removed reference in README (System Requirements) and in package.json (engines)

## 1.0.0

Features:

  - Initial release
