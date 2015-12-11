<img src="http://static.nfl.com/static/content/public/static/img/logos/nfl-engineering-light.svg" width="300" />
# React Helmet
[![npm package](https://img.shields.io/npm/v/react-helmet.svg?style=flat-square)](https://www.npmjs.org/package/react-helmet)
[![build status](https://img.shields.io/travis/nfl/react-helmet/master.svg?style=flat-square)](https://travis-ci.org/nfl/react-helmet)
[![dependency status](https://img.shields.io/david/nfl/react-helmet.svg?style=flat-square)](https://david-dm.org/nfl/react-helmet)

This reusable React component will manage all of your changes to the document head with support for document title, meta, link, script, and base tags.

Inspired by [react-document-title](https://github.com/gaearon/react-document-title)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Examples](#examples)
- [Features](#features)
- [Installation](#installation)
- [Server Usage](#server-usage)
- [Use Cases](#use-cases)
- [Contributing to this project](#contributing-to-this-project)
- [License](#license)
- [More Examples](#more-examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Examples
```javascript
import React from "react";
import Helmet from "react-helmet";

export default class Application extends React.Component {
    render() {
        return (
            <div className="application">
                <Helmet title="My Title" />
                ...
            </div>
        );
    }
};
```

```javascript
import React from "react";
import Helmet from "react-helmet";

export default class Application extends React.Component {
    render() {
        return (
            <div className="application">
                <Helmet
                    title="My Title"
                    titleTemplate="MySite.com - %s"
                    base={{"target": "_blank", "href": "http://mysite.com/"}}
                    meta={[
                        {"name": "description", "content": "Helmet application"},
                        {"property": "og:type", "content": "article"}
                    ]}
                    link={[
                        {"rel": "canonical", "href": "http://mysite.com/example"},
                        {"rel": "apple-touch-icon", "href": "http://mysite.com/img/apple-touch-icon-57x57.png"},
                        {"rel": "apple-touch-icon", "sizes": "72x72", "href": "http://mysite.com/img/apple-touch-icon-72x72.png"}
                    ]}
                    script={[
                      {"src": "http://include.com/pathtojs.js", "type": "text/javascript"}
                    ]}
                    onChangeClientState={(newState) => console.log(newState)}
                />
                ...
            </div>
        );
    }
};
```

## Features
- Supports isomorphic environment.
- Nested components override duplicate head changes.
- Duplicate head changes preserved when specified in same component (support for tags like "apple-touch-icon").
- Only valid `base`/`meta`/`link`/`script` key names allowed.
- Support for callbacks to fire when Helmet changes the DOM.

## Installation
```
npm install --save react-helmet
```

## Server Usage
To use on the server, call `rewind()` after `ReactDOM.renderToString` or `ReactDOM.renderToStaticMarkup` to get the head data for use in your prerender.

```javascript
ReactDOM.renderToString(<Handler />);
let head = Helmet.rewind();

head.title
head.base
head.meta
head.link
head.script
```

`head` contains five possible properties, `title`, `base`, `meta`, `link`, `script`:

- Each property contains `toComponent()` and `toString()` methods. Use whichever is appropriate for your environment. E.g:

### As string output
```javascript
const html = `
    <!doctype html>
    <html>
        <head>
            ${head.title.toString()}
            ${head.meta.toString()}
            ${head.link.toString()}
        </head>
        <body>
            <div id="content">
                // React stuff here
            </div>
        </body>
    </html>
`;
```

### As React components
```javascript
class HTML extends React.Component {
    render() {
        return (
            <html>
                <head>
                    {head.title.toComponent()}
                    {head.meta.toComponent()}
                    {head.link.toComponent()}
                </head>
                <body>
                    <div id="content">
                        // React stuff here
                    </div>
                </body>
            </html>
        );
    }
}
```

## Use Cases
1. Nested or latter components will override duplicate changes.
  ```javascript
  <Helmet
      title="My Title"
      meta={[
          {"name": "description", "content": "Helmet application"}
      ]}
  />
  <Helmet
      title="Nested Title"
      meta={[
          {"name": "description", "content": "Nested component"}
      ]}
  />
  ```
  Yields:
  ```
  <head>
      <title>Nested Title</title>
      <meta name="description" content="Nested component">
  </head>
  ```

2. Use a titleTemplate to format title text in your page title
  ```javascript
  <Helmet
      title="My Title"
      titleTemplate="%s | MyAwesomeWebsite.com"
  />
  <Helmet
      title="Nested Title"
  />
  ```
  Yields:
  ```
  <head>
      <title>Nested Title | MyAwesomeWebsite.com</title>
  </head>
  ```

3. Duplicate `meta` and/or `link` tags in the same component are preserved
  ```javascript
  <Helmet
      link={[
          {"rel": "apple-touch-icon", "href": "http://mysite.com/img/apple-touch-icon-57x57.png"},
          {"rel": "apple-touch-icon", "sizes": "72x72", "href": "http://mysite.com/img/apple-touch-icon-72x72.png"}
      ]}
  />
  ```
  Yields:
  ```
  <head>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png">
      <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png">
  </head>
  ```

4. Duplicate tags can still be overwritten
  ```javascript
  <Helmet
      link={[
          {"rel": "apple-touch-icon", "href": "http://mysite.com/img/apple-touch-icon-57x57.png"},
          {"rel": "apple-touch-icon", "sizes": "72x72", "href": "http://mysite.com/img/apple-touch-icon-72x72.png"}
      ]}
  />
  <Helmet
      link={[
          {"rel": "apple-touch-icon", "href": "http://mysite.com/img/apple-touch-icon-180x180.png"}
      ]}
  />
  ```
  Yields:
  ```
  <head>
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-180x180.png">
  </head>
  ```

5. Only one base tag is allowed
  ```javascript
  <Helmet
      base={{"href": "http://mysite.com/"}}
  />
  <Helmet
      base={{"href": "http://mysite.com/blog"}}
  />
  ```
  Yields:
  ```
  <head>
      <base href="http://mysite.com/blog">
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


