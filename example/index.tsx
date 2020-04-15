import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HelmetProvider, Helmet } from "../.";

const App = () => {
  const [toggle, setToggle] = React.useState(true);

  React.useEffect(() => {
    // @ts-ignore
    [...document.head.children].forEach((f) => console.log(f));
  });

  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <html lang="ja" id="html-tag" title="html tag" />
          <title>Test Title</title>
          <meta name="description" content="Test description" />
        </Helmet>

        {toggle ? (
          <div>
            <Helmet>
              <title>Child One Title</title>
              <meta name="description" content="Inner description" />
              <meta name="keywords" content="test,meta,tags" />
            </Helmet>

            <div>
              <Helmet>
                <title>{`Toggle 1: ${toggle}`}</title>
              </Helmet>
            </div>
          </div>
        ) : (
          <div>
            <Helmet>
              <title>{`Toggle 2: ${!toggle}`}</title>
            </Helmet>
          </div>
        )}

        <button onClick={() => setToggle((p) => !p)}>Test</button>
      </HelmetProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
