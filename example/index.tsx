import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HelmetProvider, Helmet } from "../.";

const App = () => {
  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <html lang="ja" id="html-tag" title="html tag" />
          <title>Test Title</title>
          <meta charSet="utf-8" />
          <meta name="description" content="Test description" />
        </Helmet>

        <div>
          <Helmet>
            <title>Child One Title</title>
            <meta name="description" content="Inner description" />
            <meta name="keywords" content="test,meta,tags" />
          </Helmet>

          <div>
            <Helmet>
              <title>Child Two Title</title>
            </Helmet>
          </div>
        </div>
      </HelmetProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
