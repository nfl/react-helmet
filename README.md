<img src="http://static.nfl.com/static/content/public/static/img/logos/nfl-engineering-light.svg" width="300" />
# React Helmet
This reusable React component will manage all of your changes to the document head with support for document title, meta & link tags.

Inspired by [react-document-title](https://github.com/gaearon/react-document-title)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Examples](#examples)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Server Usage](#server-usage)
- [Use Cases](#use-cases)
- [Contributing to this project](#contributing-to-this-project)
- [License](#license)

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
                    meta={[
                        {"name": "description", "content": "Helmet application"},
                        {"property": "og:type", "content": "article"}
                    ]}
                    link={[
                        {"rel": "canonical", "href": "http://mysite.com/example"},
                        {"rel": "apple-touch-icon", "href": "http://mysite.com/img/apple-touch-icon-57x57.png"},
                        {"rel": "apple-touch-icon", "sizes": "72x72", "href": "http://mysite.com/img/apple-touch-icon-72x72.png"}
                    ]}
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
- Only valid `meta`/`link` key names allowed.

## System Requirements
- `npm >=2.7.0`

## Installation
```
npm install --save react-helmet
```

## Server Usage
To use on the server, call `rewind()` after `React.renderToString` to get all the head changes to use in your prerender.
```javascript
React.renderToString(<Handler />);
let head = Helmet.rewind();

head.title
head.meta
head.link
```

**Note:** Because this component tracks mounted instances you will need to call rewind on the server to avoid a memory leak.

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
      <meta name="description" content="Nested component" />
  </head>
  ```

2. Duplicate `meta` and/or `link` tags in the same component are preserved
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
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="http://mysite.com/img/apple-touch-icon-72x72.png" />
  </head>
  ```

3. Duplicate tags can still be overwritten
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
      <link rel="apple-touch-icon" href="http://mysite.com/img/apple-touch-icon-180x180.png" />
  </head>
  ```

## Contributing to this project
Please take a moment to review the [guidelines for contributing](CONTRIBUTING.md).

* [Pull requests](CONTRIBUTING.md#pull-requests)
* [Development Process](CONTRIBUTING.md#development)

## License

MIT
