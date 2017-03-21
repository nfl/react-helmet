<img align="right" height="200" src="http://static.nfl.com/static/content/public/static/img/logos/nfl-engineering-light.svg" />

# React Helmet

[![npm Version](https://img.shields.io/npm/v/react-helmet.svg?style=flat-square)](https://www.npmjs.org/package/react-helmet)
[![Build Status](https://img.shields.io/travis/nfl/react-helmet/master.svg?style=flat-square)](https://travis-ci.org/nfl/react-helmet)
[![Dependency Status](https://img.shields.io/david/nfl/react-helmet.svg?style=flat-square)](https://david-dm.org/nfl/react-helmet)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)

This reusable React component will manage all of your changes to the document head with support for document title, meta, link, style, script, noscript, and base tags.

Inspired by [react-document-title](https://github.com/gaearon/react-document-title)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Examples](#examples)
- [Features](#features)
- [Installation](#installation)
- [Server Usage](#server-usage)
  - [As string output](#as-string-output)
  - [As React components](#as-react-components)
- [Use Cases](#use-cases)
- [Contributing to this project](#contributing-to-this-project)
- [License](#license)
- [More Examples](#more-examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Examples
```javascript
import React from "react";
import {Helmet} from "react-helmet";

export function Application () {
    return (
        <div className="application">
            <Helmet>
                <title>My Title</title>
            </Helmet>
            ...
        </div>
    );
};
```

```javascript
import React from "react";
import {Helmet} from "react-helmet";

export function Application () {
    return (
        <div className="application">
            <Helmet
                titleTemplate="MySite.com - %s"
                defaultTitle="My Default Title"
                onChangeClientState={(newState) => console.log(newState)}
            >
                <html lang="en" amp />
                <body className="root" />

                <title itemProp="name" lang="en">My Title</title>

                <base target="_blank" href="http://mysite.com/" />

                <meta name="description" content="Helmet application" />
                <meta property="og:type" content="article" />

                <link rel="canonical" href="http://mysite.com/example" />
                <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
                <link rel="apple-touch-icon" sizes-"72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />

                <script src="http://include.com/pathtojs.js" type="text/javascript" />
                <script type="application/ld+json">{`
                    {
                        "@context": "http://schema.org"
                    }
                `}</script>

                <noscript>{`
                    <link rel="stylesheet" type="text/css" href="foo.css" />
                `}</noscript>

                <style type="text/css">{`
                    body {
                        background-color: blue;
                    }

                    p {
                        font-size: 12px;
                    }
                `}</style>
            </Helmet>
            ...
        </div>
    );
};
```

## Features
- Supports `title`, `base`, `meta`, `link`, `script`, `noscript`, and `style` tags.
- Supports attributes for `body`, `html` and `title` tags.
- Supports universal environments.
- Nested components override duplicate head changes.
- Duplicate head changes preserved when specified in same component (support for tags like "apple-touch-icon").
- Callback for tracking DOM changes.

## Installation
```
npm install --save react-helmet
```
Dependencies: React >= 15.0.0

## Server Usage
To use on the server, call `Helmet.renderStatic()` after `ReactDOMServer.renderToString` or `ReactDOMServer.renderToStaticMarkup` to get the head data for use in your prerender.

Because this component keeps track of mounted instances, **you have to make sure to call `renderStatic` on server**, or you'll get a memory leak.

```javascript
ReactDOMServer.renderToString(<Handler />);
let helmet = Helmet.renderStatic();
```

This `helmet` instance contains the following properties:
- `base`
- `bodyAttributes`
- `htmlAttributes`
- `link`
- `meta`
- `noscript`
- `script`
- `style`
- `title`
- `titleAttributes`

Each property contains `toComponent()` and `toString()` methods. Use whichever is appropriate for your environment. For htmlAttributes, use the JSX spread operator on the object returned by `toComponent()`. E.g:

### As string output
```javascript
const html = `
    <!doctype html>
    <html ${helmet.htmlAttributes.toString()}>
        <head>
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
        </head>
        <body ${helmet.bodyAttributes.toString()}>
            <div id="content">
                // React stuff here
            </div>
        </body>
    </html>
`;
```

### As React components
```javascript
function HTML () {
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();

    return (
        <html {...htmlAttrs}>
            <head>
                {helmet.title.toComponent()}
                {helmet.meta.toComponent()}
                {helmet.link.toComponent()}
            </head>
            <body {...bodyAttrs}>
                <div id="content">
                    // React stuff here
                </div>
            </body>
        </html>
    );
}
```

## Use Cases
1. Nested or latter components will override duplicate changes.
  ```javascript
  <Helmet>
      <title>My Title</title>
      <meta name="description" content="Helmet application" />
  </Helmet>
  <Helmet>
      <title>Nested Title</title>
      <meta name="description" content="Nested component" />
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <title>Nested Title</title>
      <meta name="description" content="Nested component">
  </head>
  ```

2. Use a titleTemplate to format title text in your page title
  ```javascript
  <Helmet
      titleTemplate="%s | MyAwesomeWebsite.com"
  >
      <title>My Title</title>
  </Helmet>
  <Helmet>
      <title>Nested Title</title>
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <title>Nested Title | MyAwesomeWebsite.com</title>
  </head>
  ```

3. Duplicate `meta` and/or `link` tags in the same component are preserved
  ```javascript
  <Helmet>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png">
      <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png">
  </head>
  ```

4. Duplicate tags can still be overwritten
  ```javascript
  <Helmet>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />
  </Helmet>
  <Helmet>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-180x180.png" />
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-180x180.png">
  </head>
  ```

5. Only one base tag is allowed
  ```javascript
  <Helmet>
      <base href="http://mysite.com/" />
  </Helmet>
  <Helmet>
      <base href="http://mysite.com/blog" />
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <base href="http://mysite.com/blog">
  </head>
  ```

6. defaultTitle can be used as a fallback when the template does not want to be used in the current Helmet
  ```javascript
  <Helmet
      defaultTitle="My Site"
      titleTemplate="My Site - %s"
  />
  ```
  Yields:
  ```html
  <head>
      <title>My Site</title>
  </head>
  ```

  But a child route with a title will use the titleTemplate, giving users a way to declare a titleTemplate for their app, but not have it apply to the root.

  ```javascript
  <Helmet
      defaultTitle="My Site"
      titleTemplate="My Site - %s"
  />

  <Helmet>
      <title>Nested Title</title>
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <title>My Site - Nested Title</title>
  </head>
  ```

  And other child route components without a Helmet will inherit the defaultTitle.

7. Usage with `<script>` tags:
  ```javascript
  <Helmet>
      <script type="application/ld+json">{`
          {
              "@context": "http://schema.org",
              "@type": "NewsArticle"
          }
      `}</script>
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <script type="application/ld+json">
          {
              "@context": "http://schema.org",
              "@type": "NewsArticle"
          }
      </script>
  </head>
  ```

8. Usage with `<style>` tags:
  ```javascript
  <Helmet>
      <style>{`
          body {
              background-color: green;
          }
      `}</style>
  </Helmet>
  ```
  Yields:
  ```html
  <head>
      <style>
          body {
              background-color: green;
          }
      </style>
  </head>
  ```

## Contributing to this project
Please take a moment to review the [guidelines for contributing](CONTRIBUTING.md).

* [Pull requests](CONTRIBUTING.md#pull-requests)
* [Development Process](CONTRIBUTING.md#development)

## License

MIT

## More Examples
[react-helmet-example](https://github.com/mattdennewitz/react-helmet-example)
