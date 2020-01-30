<img align="right" width="200" src="https://github.com/kokushkin/react-helmet-with-visor/blob/release/5.4.0/logo.png?raw=true" />

# React Helmet With Visor

Fork of the famous **react-helmet** v5 library with the goal to inject SEO-like scripts at runtime. For main documentation, please refer to original repository (https://github.com/nfl/react-helmet). One of the possible issues it can solve: https://github.com/nfl/react-helmet/issues/323 . The plans are marge it back to **react-helmet** repository as soon as possible, if they would like to accept our PR.
Unfortanat

Unfortunately, for technical reasons, HelmetsOpenedVisor doesn't support toComponent functionality and no full support for PhantomJS browser.

## Example
```javascript
import React from "react";
import {Helmet} from "react-helmet";

class Application extends React.Component {
  render () {
    return (
        <div className="application">
            <Helmet>
                <meta charSet="utf-8" />
                <title>My Title</title>
                <link rel="canonical" href="http://mysite.com/example" />
                <HelmetsOpenedVisor>
                {`<script data-react-helmet="true">
                        !function (f, b, e, v, n, t, s) {
                            if (f.fbq) return; n = f.fbq = function () {
                                n.callMethod ?
                                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                            };
                            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = \'2.0\';
                            n.queue = []; t = b.createElement(e); t.async = !0;
                            t.src = v; s = b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t, s)
                        }(window, document, \'script\',
                            \'https://connect.facebook.net/en_US/fbevents.js\');
                        fbq(\'init\', \'*************\');
                        fbq(\'track\', \'PageView\');
                    </script><noscript data-react-helmet="true">
                            &lt;img height="1" width="1" style="display:none"
                                    src="https://www.facebook.com/tr?id=************&amp;ev=PageView&amp;noscript=1"/&gt;
                    </noscript>`}
                </HelmetsOpenedVisor>
            </Helmet>
            ...
        </div>
    );
  }
};
```

### As string output
```javascript
const html = `
    <!doctype html>
    <html ${helmet.htmlAttributes.toString()}>
        <head>
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
            ${helmet.openedVisor.toString()}
        </head>
        <body ${helmet.bodyAttributes.toString()}>
            <div id="content">
                // React stuff here
            </div>
        </body>
    </html>
`;
```
