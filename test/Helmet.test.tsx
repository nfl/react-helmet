/* eslint max-nested-callbacks: [1, 7] */
/* eslint-disable import/no-named-as-default */

import React from "react";
import ReactDOM from "react-dom";
import ReactServer from "react-dom/server";
import { Helmet } from "../src/Helmet";
import { requestAnimationFrame } from "../src/HelmetUtils";
import sinon, { SinonSpy } from "sinon";

// $FIXME: Refactor is complete when this is removed
type $FIXME = any;

declare global {
  interface Window {
    __spy__: SinonSpy;
  }
}

const HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", () => {
  let headElement: $FIXME;

  const container = document.createElement("div");

  beforeEach(() => {
    headElement =
      headElement || document.head || document.querySelector("head");

    // resets DOM after each run
    headElement.innerHTML = "";
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  describe("api", () => {
    describe("title", () => {
      it("updates page title", (done) => {
        ReactDOM.render(
          <Helmet defaultTitle={"Fallback"} title={"Test Title"} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe("Test Title");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("updates page title with multiple children", (done) => {
        ReactDOM.render(
          <div>
            <Helmet title={"Test Title"} />
            <Helmet title={"Child One Title"} />
            <Helmet title={"Child Two Title"} />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe("Child Two Title");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets title based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet title={"Main Title"} />
            <div>
              <Helmet title={"Nested Title"} />
            </div>
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe("Nested Title");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets title using deepest nested component with a defined title", (done) => {
        ReactDOM.render(
          <div>
            <Helmet title={"Main Title"} />
            <Helmet />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe("Main Title");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("uses defaultTitle if no title is defined", (done) => {
        ReactDOM.render(
          <Helmet
            defaultTitle={"Fallback"}
            title={""}
            titleTemplate={"This is a %s of the titleTemplate feature"}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe("Fallback");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("uses a titleTemplate and a child <title>", (done) => {
        ReactDOM.render(
          <Helmet
            defaultTitle={"Fallback"}
            titleTemplate={"This is a %s of the titleTemplate feature"}
          >
            <title>Test</title>
          </Helmet>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "This is a Test of the titleTemplate feature"
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("uses a titleTemplate and a child <title> via a template?", (done) => {
        ReactDOM.render(
          <Helmet
            defaultTitle={"Fallback"}
            titleTemplate={"This is a %s of the titleTemplate feature"}
          >
            <title>{`${"Test"}`}</title>
          </Helmet>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "This is a Test of the titleTemplate feature"
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("uses a titleTemplate if defined", (done) => {
        ReactDOM.render(
          <Helmet
            defaultTitle={"Fallback"}
            title={"Test"}
            titleTemplate={"This is a %s of the titleTemplate feature"}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "This is a Test of the titleTemplate feature"
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("replaces multiple title strings in titleTemplate", (done) => {
        ReactDOM.render(
          <Helmet
            title={"Test"}
            titleTemplate={
              "This is a %s of the titleTemplate feature. Another %s."
            }
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "This is a Test of the titleTemplate feature. Another Test."
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("uses a titleTemplate based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              title={"Test"}
              titleTemplate={"This is a %s of the titleTemplate feature"}
            />
            <Helmet
              title={"Second Test"}
              titleTemplate={"A %s using nested titleTemplate attributes"}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "A Second Test using nested titleTemplate attributes"
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("merges deepest component title with nearest upstream titleTemplate", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              title={"Test"}
              titleTemplate={"This is a %s of the titleTemplate feature"}
            />
            <Helmet title={"Second Test"} />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(
              "This is a Second Test of the titleTemplate feature"
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("renders dollar characters in a title correctly when titleTemplate present", (done) => {
        const dollarTitle = "te$t te$$t te$$$t te$$$$t";

        ReactDOM.render(
          <Helmet title={dollarTitle} titleTemplate={"This is a %s"} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(`This is a ${dollarTitle}`);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not encode all characters with HTML character entity equivalents", (done) => {
        const chineseTitle = "膣膗 鍆錌雔";

        ReactDOM.render(
          <div>
            <Helmet title={chineseTitle} />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(document.title).toBe(chineseTitle);
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("page title with prop itemprop", (done) => {
        ReactDOM.render(
          <Helmet
            defaultTitle={"Fallback"}
            title={"Test Title with itemProp"}
            titleAttributes={{ itemprop: "name" }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const titleTag = document.getElementsByTagName("title")[0];
            expect(document.title).toBe("Test Title with itemProp");
            expect(titleTag.getAttribute("itemprop")).toBe("name");
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("title attributes", () => {
      beforeEach(() => {
        headElement.innerHTML = `<title>Test Title</title>`;
      });

      it("update title attributes", (done) => {
        ReactDOM.render(
          <Helmet
            titleAttributes={{
              itemprop: "name",
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const titleTag = document.getElementsByTagName("title")[0];
            expect(titleTag.getAttribute("itemprop")).toBe("name");
            expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).toBe("itemprop");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets attributes based on the deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              titleAttributes={{
                lang: "en",
                hidden: undefined,
              }}
            />
            <Helmet
              titleAttributes={{
                lang: "ja",
              }}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const titleTag = document.getElementsByTagName("title")[0];
            expect(titleTag.getAttribute("lang")).toBe("ja");
            expect(titleTag.getAttribute("hidden")).toBe("");
            expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).toBe("lang,hidden");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("handles valueless attributes", (done) => {
        ReactDOM.render(
          <Helmet
            titleAttributes={{
              hidden: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const titleTag = document.getElementsByTagName("title")[0];
            expect(titleTag.getAttribute("hidden")).toBe("");
            expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).toBe("hidden");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears title attributes that are handled within helmet", (done) => {
        ReactDOM.render(
          <Helmet
            titleAttributes={{
              lang: "en",
              hidden: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          ReactDOM.render(<Helmet />, container);

          requestAnimationFrame(() => {
            try {
              const titleTag = document.getElementsByTagName("title")[0];
              expect(titleTag.getAttribute("lang")).toBeNull();
              expect(titleTag.getAttribute("hidden")).toBeNull();
              expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).toBeNull();
              done();
            } catch (e) {
              done(e);
            }
          });
        });
      });
    });

    describe("html attributes", () => {
      it("updates html attributes", (done) => {
        ReactDOM.render(
          <Helmet
            htmlAttributes={{
              class: "myClassName",
              lang: "en",
            }}
            lang="en"
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const htmlTag = document.getElementsByTagName("html")[0];
            expect(htmlTag.getAttribute("class")).toBe("myClassName");
            expect(htmlTag.getAttribute("lang")).toBe("en");
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe("class,lang");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets attributes based on the deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              htmlAttributes={{
                lang: "en",
              }}
            />
            <Helmet
              htmlAttributes={{
                lang: "ja",
              }}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const htmlTag = document.getElementsByTagName("html")[0];
            expect(htmlTag.getAttribute("lang")).toBe("ja");
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe("lang");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("handles valueless attributes", (done) => {
        ReactDOM.render(
          <Helmet
            htmlAttributes={{
              amp: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const htmlTag = document.getElementsByTagName("html")[0];
            expect(htmlTag.getAttribute("amp")).toBe("");
            expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe("amp");
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears html attributes that are handled within helmet", (done) => {
        ReactDOM.render(
          <Helmet
            htmlAttributes={{
              lang: "en",
              amp: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          ReactDOM.render(<Helmet />, container);

          requestAnimationFrame(() => {
            try {
              const htmlTag = document.getElementsByTagName("html")[0];
              expect(htmlTag.getAttribute("lang")).toBeNull();
              expect(htmlTag.getAttribute("amp")).toBeNull();
              expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBeNull();
              done();
            } catch (e) {
              done(e);
            }
          });
        });
      });

      it("updates with multiple additions and removals - overwrite and new", (done) => {
        ReactDOM.render(
          <Helmet
            htmlAttributes={{
              lang: "en",
              amp: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(
              <Helmet
                htmlAttributes={{
                  lang: "ja",
                  id: "html-tag",
                  title: "html tag",
                }}
              />,
              container
            );

            requestAnimationFrame(() => {
              try {
                const htmlTag = document.getElementsByTagName("html")[0];
                expect(htmlTag.getAttribute("amp")).toBeNull();
                expect(htmlTag.getAttribute("lang")).toBe("ja");
                expect(htmlTag.getAttribute("id")).toBe("html-tag");
                expect(htmlTag.getAttribute("title")).toBe("html tag");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe(
                  "lang,id,title"
                );

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("updates with multiple additions and removals - all new", (done) => {
        ReactDOM.render(
          <Helmet
            htmlAttributes={{
              lang: "en",
              amp: undefined,
            }}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(
              <Helmet
                htmlAttributes={{
                  id: "html-tag",
                  title: "html tag",
                }}
              />,
              container
            );

            requestAnimationFrame(() => {
              try {
                const htmlTag = document.getElementsByTagName("html")[0];
                expect(htmlTag.getAttribute("amp")).toBeNull();
                expect(htmlTag.getAttribute("lang")).toBeNull();
                expect(htmlTag.getAttribute("id")).toBe("html-tag");
                expect(htmlTag.getAttribute("title")).toBe("html tag");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe("id,title");

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      describe("initialized outside of helmet", () => {
        beforeAll(() => {
          const htmlTag = document.getElementsByTagName("html")[0];
          htmlTag.setAttribute("test", "test");
        });

        it("attributes are not cleared", (done) => {
          ReactDOM.render(<Helmet />, container);

          requestAnimationFrame(() => {
            try {
              const htmlTag = document.getElementsByTagName("html")[0];
              expect(htmlTag.getAttribute("test")).toBe("test");
              expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBeNull();

              done();
            } catch (e) {
              done(e);
            }
          });
        });

        it("attributes are overwritten if specified in helmet", (done) => {
          ReactDOM.render(
            <Helmet
              htmlAttributes={{
                test: "helmet-attr",
              }}
            />,
            container
          );

          requestAnimationFrame(() => {
            try {
              const htmlTag = document.getElementsByTagName("html")[0];
              expect(htmlTag.getAttribute("test")).toBe("helmet-attr");
              expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBe("test");

              done();
            } catch (e) {
              done(e);
            }
          });
        });

        it("attributes are cleared once managed in helmet", (done) => {
          ReactDOM.render(
            <Helmet
              htmlAttributes={{
                test: "helmet-attr",
              }}
            />,
            container
          );

          requestAnimationFrame(() => {
            try {
              ReactDOM.render(<Helmet />, container);

              requestAnimationFrame(() => {
                try {
                  const htmlTag = document.getElementsByTagName("html")[0];
                  expect(htmlTag.getAttribute("test")).toBeNull();
                  expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).toBeNull();

                  done();
                } catch (e) {
                  done(e);
                }
              });
            } catch (e) {
              done(e);
            }
          });
        });
      });
    });

    describe("onChangeClientState", () => {
      it("when handling client state change, calls the function with new state, addedTags and removedTags ", (done) => {
        const spy = sinon.spy();
        ReactDOM.render(
          <div>
            <Helmet
              base={{ href: "http://mysite.com/" }}
              link={[
                {
                  href: "http://localhost/helmet",
                  rel: "canonical",
                },
              ]}
              meta={[{ charset: "utf-8" }]}
              script={[
                {
                  src: "http://localhost/test.js",
                  type: "text/javascript",
                },
              ]}
              title={"Main Title"}
              onChangeClientState={spy}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(spy.called).toBe(true);
            const newState = spy.getCall(0).args[0];
            const addedTags = spy.getCall(0).args[1];
            const removedTags = spy.getCall(0).args[2];

            expect(newState).toMatchObject({ title: "Main Title" });
            expect(newState.baseTag).toEqual(
              expect.arrayContaining([
                {
                  href: "http://mysite.com/",
                },
              ])
            );
            expect(newState.metaTags).toEqual(
              expect.arrayContaining([
                {
                  charset: "utf-8",
                },
              ])
            );
            expect(newState.linkTags).toEqual(
              expect.arrayContaining([
                {
                  href: "http://localhost/helmet",
                  rel: "canonical",
                },
              ])
            );
            expect(newState.scriptTags).toEqual(
              expect.arrayContaining([
                {
                  src: "http://localhost/test.js",
                  type: "text/javascript",
                },
              ])
            );

            expect(addedTags).toHaveProperty("baseTag");
            expect(addedTags.baseTag.length).toBeGreaterThanOrEqual(0);
            expect(addedTags.baseTag[0].outerHTML).toBe(
              `<base href="http://mysite.com/" data-react-helmet="true">`
            );

            expect(addedTags).toHaveProperty("metaTags");
            expect(addedTags.metaTags.length).toBeGreaterThanOrEqual(0);
            expect(addedTags.metaTags[0].outerHTML).toBe(
              `<meta charset="utf-8" data-react-helmet="true">`
            );

            expect(addedTags).toHaveProperty("linkTags");
            expect(addedTags.linkTags.length).toBeGreaterThanOrEqual(0);
            expect(addedTags.linkTags[0].outerHTML).toBe(
              `<link href="http://localhost/helmet" rel="canonical" data-react-helmet="true">`
            );

            expect(addedTags).toHaveProperty("scriptTags");
            expect(addedTags.scriptTags.length).toBeGreaterThanOrEqual(0);
            expect(addedTags.scriptTags[0].outerHTML).toBe(
              `<script src="http://localhost/test.js" type="text/javascript" data-react-helmet="true"></script>`
            );

            expect(Object.keys(removedTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("calls the deepest defined callback with the deepest state", (done) => {
        const spy = sinon.spy();
        ReactDOM.render(
          <div>
            <Helmet title={"Main Title"} onChangeClientState={spy} />
            <Helmet title={"Deeper Title"} />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            expect(spy.callCount).toBe(1);
            expect(spy.getCall(0).args[0]).toMatchObject({
              title: "Deeper Title",
            });

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("base tag", () => {
      it("updates base tag with href property", (done) => {
        ReactDOM.render(
          <Helmet base={{ href: "http://mysite.com/" }} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `base[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();

            const filteredTags = [].slice
              .call(existingTags)
              .filter((tag: $FIXME) => {
                return tag.getAttribute("href") === "http://mysite.com/";
              });

            expect(filteredTags.length).toBe(1);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("updates base tag with target property", (done) => {
        ReactDOM.render(<Helmet base={{ target: "_blank" }} />, container);

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `base[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();

            const filteredTags = [].slice
              .call(existingTags)
              .filter((tag: $FIXME) => {
                return tag.getAttribute("target") === "_blank";
              });

            expect(filteredTags.length).toBe(1);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears the base tag if one is not specified", (done) => {
        ReactDOM.render(
          <Helmet base={{ href: "http://mysite.com/" }} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const existingTags = headElement.querySelectorAll(
                  `base[${HELMET_ATTRIBUTE}]`
                );

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'href' or 'target' are not accepted", (done) => {
        ReactDOM.render(
          <Helmet base={{ property: "won't work" }} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `base[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets base tag based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet base={{ href: "http://mysite.com/" }} />
            <Helmet
              base={{
                href: "http://mysite.com/public",
                target: "_parent",
              }}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `base[${HELMET_ATTRIBUTE}]`
            );
            const firstTag = Array.prototype.slice.call(existingTags)[0];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(1);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("href")).toBe(
              "http://mysite.com/public"
            );
            expect(firstTag.getAttribute("target")).toBe("_parent");
            expect(firstTag.outerHTML).toBe(
              `<base href="http://mysite.com/public" target="_parent" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute is null", (done) => {
        ReactDOM.render(<Helmet base={{ href: undefined }} />, container);

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `base[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("meta tags", () => {
      it("updates meta tags", (done) => {
        ReactDOM.render(
          <Helmet
            meta={[
              { charset: "utf-8" },
              {
                name: "description",
                content: "Test description",
              },
              {
                "http-equiv": "content-type",
                content: "text/html",
              },
              { property: "og:type", content: "article" },
              { itemprop: "name", content: "Test name itemprop" },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);

            expect(existingTags).toBeDefined();

            const filteredTags = [].slice
              .call(existingTags)
              .filter((tag: $FIXME) => {
                return (
                  tag.getAttribute("charset") === "utf-8" ||
                  (tag.getAttribute("name") === "description" &&
                    tag.getAttribute("content") === "Test description") ||
                  (tag.getAttribute("http-equiv") === "content-type" &&
                    tag.getAttribute("content") === "text/html") ||
                  (tag.getAttribute("itemprop") === "name" &&
                    tag.getAttribute("content") === "Test name itemprop")
                );
              });

            expect(filteredTags.length).toBeGreaterThanOrEqual(4);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears all meta tags if none are specified", (done) => {
        ReactDOM.render(
          <Helmet
            meta={[{ name: "description", content: "Test description" }]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const existingTags = headElement.querySelectorAll(
                  `meta[${HELMET_ATTRIBUTE}]`
                );

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'name', 'http-equiv', 'property', 'charset', or 'itemprop' are not accepted", (done) => {
        ReactDOM.render(<Helmet meta={[{ href: "won't work" }]} />, container);

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets meta tags based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              meta={[
                { charset: "utf-8" },
                {
                  name: "description",
                  content: "Test description",
                },
              ]}
            />
            <Helmet
              meta={[
                {
                  name: "description",
                  content: "Inner description",
                },
                { name: "keywords", content: "test,meta,tags" },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);

            const firstTag = existingTags[0];
            const secondTag = existingTags[1];
            const thirdTag = existingTags[2];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(3);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("charset")).toBe("utf-8");
            expect(firstTag.outerHTML).toBe(
              `<meta charset="utf-8" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("name")).toBe("description");
            expect(secondTag.getAttribute("content")).toBe("Inner description");
            expect(secondTag.outerHTML).toBe(
              `<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(2);
            expect(existingTags[2]).toBeInstanceOf(Element);
            expect(thirdTag).toHaveProperty("getAttribute");
            expect(thirdTag.getAttribute("name")).toBe("keywords");
            expect(thirdTag.getAttribute("content")).toBe("test,meta,tags");
            expect(thirdTag.outerHTML).toBe(
              `<meta name="keywords" content="test,meta,tags" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("allows duplicate meta tags if specified in the same component", (done) => {
        ReactDOM.render(
          <Helmet
            meta={[
              {
                name: "description",
                content: "Test description",
              },
              {
                name: "description",
                content: "Duplicate description",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("name")).toBe("description");
            expect(firstTag.getAttribute("content")).toBe("Test description");
            expect(firstTag.outerHTML).toBe(
              `<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("name")).toBe("description");
            expect(secondTag.getAttribute("content")).toBe(
              "Duplicate description"
            );
            expect(secondTag.outerHTML).toBe(
              `<meta name="description" content="Duplicate description" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("overrides duplicate meta tags with single meta tag in a nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              meta={[
                {
                  name: "description",
                  content: "Test description",
                },
                {
                  name: "description",
                  content: "Duplicate description",
                },
              ]}
            />
            <Helmet
              meta={[
                {
                  name: "description",
                  content: "Inner description",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(1);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("name")).toBe("description");
            expect(firstTag.getAttribute("content")).toBe("Inner description");
            expect(firstTag.outerHTML).toBe(
              `<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("overrides single meta tag with duplicate meta tags in a nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              meta={[
                {
                  name: "description",
                  content: "Test description",
                },
              ]}
            />
            <Helmet
              meta={[
                {
                  name: "description",
                  content: "Inner description",
                },
                {
                  name: "description",
                  content: "Inner duplicate description",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("name")).toBe("description");
            expect(firstTag.getAttribute("content")).toBe("Inner description");
            expect(firstTag.outerHTML).toBe(
              `<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("name")).toBe("description");
            expect(secondTag.getAttribute("content")).toBe(
              "Inner duplicate description"
            );
            expect(secondTag.outerHTML).toBe(
              `<meta name="description" content="Inner duplicate description" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute is null", (done) => {
        ReactDOM.render(
          <Helmet
            meta={[
              {
                name: undefined,
                content: "Inner duplicate description",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("fails gracefully when meta is wrong shape", (done) => {
        const error = sinon.stub(console, "error");
        const warn = sinon.stub(console, "warn");

        ReactDOM.render(
          <Helmet meta={{ name: "title", content: "some title" }} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `meta[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            expect(error.called).toBe(true);
            expect(warn.called).toBe(true);

            const [warning] = warn.getCall(0).args;
            expect(warning).toBe(
              `Helmet: meta should be of type "Array". Instead found type "object"`
            );

            error.restore();
            warn.restore();

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("link tags", () => {
      it("updates link tags", (done) => {
        ReactDOM.render(
          <Helmet
            link={[
              {
                href: "http://localhost/helmet",
                rel: "canonical",
              },
              {
                href: "http://localhost/style.css",
                rel: "stylesheet",
                type: "text/css",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);

            expect(existingTags).toBeDefined();

            const filteredTags = [].slice
              .call(existingTags)
              .filter((tag: $FIXME) => {
                return (
                  (tag.getAttribute("href") === "http://localhost/style.css" &&
                    tag.getAttribute("rel") === "stylesheet" &&
                    tag.getAttribute("type") === "text/css") ||
                  (tag.getAttribute("href") === "http://localhost/helmet" &&
                    tag.getAttribute("rel") === "canonical")
                );
              });

            expect(filteredTags.length).toBeGreaterThanOrEqual(2);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears all link tags if none are specified", (done) => {
        ReactDOM.render(
          <Helmet
            link={[
              {
                href: "http://localhost/helmet",
                rel: "canonical",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const tagNodes = headElement.querySelectorAll(
                  `link[${HELMET_ATTRIBUTE}]`
                );
                const existingTags = Array.prototype.slice.call(tagNodes);

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'href' or 'rel' are not accepted, even if they are valid for other tags", (done) => {
        ReactDOM.render(
          <Helmet link={[{ "http-equiv": "won't work" }]} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags 'rel' and 'href' properly use 'rel' as the primary identification for this tag, regardless of ordering", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              link={[
                {
                  href: "http://localhost/helmet",
                  rel: "canonical",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/new",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  href: "http://localhost/helmet/newest",
                  rel: "canonical",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(1);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("rel")).toBe("canonical");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/helmet/newest"
            );
            expect(firstTag.outerHTML).toBe(
              `<link href="http://localhost/helmet/newest" rel="canonical" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags with rel='stylesheet' uses the href as the primary identification of the tag, regardless of ordering", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              link={[
                {
                  href: "http://localhost/style.css",
                  rel: "stylesheet",
                  type: "text/css",
                  media: "all",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  rel: "stylesheet",
                  href: "http://localhost/inner.css",
                  type: "text/css",
                  media: "all",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/style.css"
            );
            expect(firstTag.getAttribute("rel")).toBe("stylesheet");
            expect(firstTag.getAttribute("type")).toBe("text/css");
            expect(firstTag.getAttribute("media")).toBe("all");
            expect(firstTag.outerHTML).toBe(
              `<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("rel")).toBe("stylesheet");
            expect(secondTag.getAttribute("href")).toBe(
              "http://localhost/inner.css"
            );
            expect(secondTag.getAttribute("type")).toBe("text/css");
            expect(secondTag.getAttribute("media")).toBe("all");
            expect(secondTag.outerHTML).toBe(
              `<link rel="stylesheet" href="http://localhost/inner.css" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets link tags based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet",
                },
                {
                  href: "http://localhost/style.css",
                  rel: "stylesheet",
                  type: "text/css",
                  media: "all",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/innercomponent",
                },
                {
                  href: "http://localhost/inner.css",
                  rel: "stylesheet",
                  type: "text/css",
                  media: "all",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];
            const thirdTag = existingTags[2];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBeGreaterThanOrEqual(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/style.css"
            );
            expect(firstTag.getAttribute("rel")).toBe("stylesheet");
            expect(firstTag.getAttribute("type")).toBe("text/css");
            expect(firstTag.getAttribute("media")).toBe("all");
            expect(firstTag.outerHTML).toBe(
              `<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("href")).toBe(
              "http://localhost/helmet/innercomponent"
            );
            expect(secondTag.getAttribute("rel")).toBe("canonical");
            expect(secondTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(2);
            expect(existingTags[2]).toBeInstanceOf(Element);
            expect(thirdTag).toHaveProperty("getAttribute");
            expect(thirdTag.getAttribute("href")).toBe(
              "http://localhost/inner.css"
            );
            expect(thirdTag.getAttribute("rel")).toBe("stylesheet");
            expect(thirdTag.getAttribute("type")).toBe("text/css");
            expect(thirdTag.getAttribute("media")).toBe("all");
            expect(thirdTag.outerHTML).toBe(
              `<link href="http://localhost/inner.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("allows duplicate link tags if specified in the same component", (done) => {
        ReactDOM.render(
          <Helmet
            link={[
              {
                rel: "canonical",
                href: "http://localhost/helmet",
              },
              {
                rel: "canonical",
                href: "http://localhost/helmet/component",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBeGreaterThanOrEqual(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("rel")).toBe("canonical");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/helmet"
            );
            expect(firstTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("rel")).toBe("canonical");
            expect(secondTag.getAttribute("href")).toBe(
              "http://localhost/helmet/component"
            );
            expect(secondTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("overrides duplicate link tags with a single link tag in a nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet",
                },
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/component",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/innercomponent",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(1);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("rel")).toBe("canonical");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/helmet/innercomponent"
            );
            expect(firstTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("overrides single link tag with duplicate link tags in a nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet",
                },
              ]}
            />
            <Helmet
              link={[
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/component",
                },
                {
                  rel: "canonical",
                  href: "http://localhost/helmet/innercomponent",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBe(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("rel")).toBe("canonical");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/helmet/component"
            );
            expect(firstTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("rel")).toBe("canonical");
            expect(secondTag.getAttribute("href")).toBe(
              "http://localhost/helmet/innercomponent"
            );
            expect(secondTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute is null", (done) => {
        ReactDOM.render(
          <Helmet
            link={[
              { rel: "icon", sizes: "192x192", href: null },
              {
                rel: "canonical",
                href: "http://localhost/helmet/component",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `link[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(1);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("rel")).toBe("canonical");
            expect(firstTag.getAttribute("href")).toBe(
              "http://localhost/helmet/component"
            );
            expect(firstTag.outerHTML).toBe(
              `<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("script tags", () => {
      it("updates script tags", (done) => {
        const scriptInnerHTML = `
                  {
                    "@context": "http://schema.org",
                    "@type": "NewsArticle",
                    "url": "http://localhost/helmet"
                  }
                `;
        ReactDOM.render(
          <Helmet
            script={[
              {
                src: "http://localhost/test.js",
                type: "text/javascript",
              },
              {
                src: "http://localhost/test2.js",
                type: "text/javascript",
              },
              {
                type: "application/ld+json",
                innerHTML: scriptInnerHTML,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.getElementsByTagName("script");

            expect(existingTags).toBeDefined();

            const filteredTags = [].slice
              .call(existingTags)
              .filter((tag: $FIXME) => {
                return (
                  (tag.getAttribute("src") === "http://localhost/test.js" &&
                    tag.getAttribute("type") === "text/javascript") ||
                  (tag.getAttribute("src") === "http://localhost/test2.js" &&
                    tag.getAttribute("type") === "text/javascript") ||
                  (tag.getAttribute("type") === "application/ld+json" &&
                    tag.innerHTML === scriptInnerHTML)
                );
              });

            expect(filteredTags.length).toBeGreaterThanOrEqual(3);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears all scripts tags if none are specified", (done) => {
        ReactDOM.render(
          <Helmet
            script={[
              {
                src: "http://localhost/test.js",
                type: "text/javascript",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const existingTags = headElement.querySelectorAll(
                  `script[${HELMET_ATTRIBUTE}]`
                );

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'src' are not accepted", (done) => {
        ReactDOM.render(
          <Helmet script={[{ property: "won't work" }]} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `script[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets script tags based on deepest nested component", (done) => {
        ReactDOM.render(
          <div>
            <Helmet
              script={[
                {
                  src: "http://localhost/test.js",
                  type: "text/javascript",
                },
              ]}
            />
            <Helmet
              script={[
                {
                  src: "http://localhost/test2.js",
                  type: "text/javascript",
                },
              ]}
            />
          </div>,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `script[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            const firstTag = existingTags[0];
            const secondTag = existingTags[1];

            expect(existingTags).toBeDefined();

            expect(existingTags.length).toBeGreaterThanOrEqual(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("src")).toBe(
              "http://localhost/test.js"
            );
            expect(firstTag.getAttribute("type")).toBe("text/javascript");
            expect(firstTag.outerHTML).toBe(
              `<script src="http://localhost/test.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag).toHaveProperty("getAttribute");
            expect(secondTag.getAttribute("src")).toBe(
              "http://localhost/test2.js"
            );
            expect(secondTag.getAttribute("type")).toBe("text/javascript");
            expect(secondTag.outerHTML).toBe(
              `<script src="http://localhost/test2.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("sets undefined attribute values to empty strings", (done) => {
        ReactDOM.render(
          <Helmet
            script={[
              {
                src: "foo.js",
                async: undefined,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTag = headElement.querySelector(
              `script[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTag).toBeDefined();
            expect(typeof existingTag.outerHTML).toBe("string");
            expect(existingTag.outerHTML).toBe(
              `<script src="foo.js" async="" ${HELMET_ATTRIBUTE}="true"></script>`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute (src) is null", (done) => {
        ReactDOM.render(
          <Helmet
            script={[
              {
                src: undefined,
                type: "text/javascript",
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `script[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute (innerHTML) is null", (done) => {
        ReactDOM.render(
          <Helmet
            script={[
              {
                innerHTML: undefined,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `script[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("noscript tags", () => {
      it("updates noscript tags", (done) => {
        const noscriptInnerHTML = `<link rel="stylesheet" type="text/css" href="foo.css" />`;
        ReactDOM.render(
          <Helmet noscript={[{ id: "bar", innerHTML: noscriptInnerHTML }]} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.getElementsByTagName("noscript");

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(1);
            expect(
              existingTags[0].innerHTML === noscriptInnerHTML &&
                existingTags[0].id === "bar"
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears all noscripts tags if none are specified", (done) => {
        ReactDOM.render(<Helmet noscript={[{ id: "bar" }]} />, container);

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const existingTags = headElement.querySelectorAll(
                  `script[${HELMET_ATTRIBUTE}]`
                );

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'innerHTML' are not accepted", (done) => {
        ReactDOM.render(
          <Helmet noscript={[{ property: "won't work" }]} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `noscript[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute is null", (done) => {
        ReactDOM.render(
          <Helmet
            noscript={[
              {
                innerHTML: undefined,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `noscript[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });

    describe("style tags", () => {
      it("updates style tags", (done) => {
        const cssText1 = `
                    body {
                        background-color: green;
                    }
                `;
        const cssText2 = `
                    p {
                        font-size: 12px;
                    }
                `;
        ReactDOM.render(
          <Helmet
            style={[
              {
                type: "text/css",
                cssText: cssText1,
              },
              {
                cssText: cssText2,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `style[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);

            const [firstTag, secondTag] = existingTags;
            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(2);

            expect(existingTags.length).toBeGreaterThanOrEqual(0);
            expect(existingTags[0]).toBeInstanceOf(Element);
            expect(firstTag).toHaveProperty("getAttribute");
            expect(firstTag.getAttribute("type")).toBe("text/css");
            expect(firstTag.innerHTML).toBe(cssText1);
            expect(firstTag.outerHTML).toBe(
              `<style type="text/css" ${HELMET_ATTRIBUTE}="true">${cssText1}</style>`
            );

            expect(existingTags.length).toBeGreaterThanOrEqual(1);
            expect(existingTags[1]).toBeInstanceOf(Element);
            expect(secondTag.innerHTML).toBe(cssText2);
            expect(secondTag.outerHTML).toBe(
              `<style ${HELMET_ATTRIBUTE}="true">${cssText2}</style>`
            );

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("clears all style tags if none are specified", (done) => {
        const cssText = `
                    body {
                        background-color: green;
                    }
                `;
        ReactDOM.render(
          <Helmet
            style={[
              {
                type: "text/css",
                cssText,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            ReactDOM.render(<Helmet />, container);

            requestAnimationFrame(() => {
              try {
                const existingTags = headElement.querySelectorAll(
                  `style[${HELMET_ATTRIBUTE}]`
                );

                expect(existingTags).toBeDefined();
                expect(existingTags.length).toBe(0);

                done();
              } catch (e) {
                done(e);
              }
            });
          } catch (e) {
            done(e);
          }
        });
      });

      it("tags without 'cssText' are not accepted", (done) => {
        ReactDOM.render(
          <Helmet style={[{ property: "won't work" }]} />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const existingTags = headElement.querySelectorAll(
              `style[${HELMET_ATTRIBUTE}]`
            );

            expect(existingTags).toBeDefined();
            expect(existingTags.length).toBe(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("does not render tag when primary attribute is null", (done) => {
        ReactDOM.render(
          <Helmet
            style={[
              {
                cssText: undefined,
              },
            ]}
          />,
          container
        );

        requestAnimationFrame(() => {
          try {
            const tagNodes = headElement.querySelectorAll(
              `style[${HELMET_ATTRIBUTE}]`
            );
            const existingTags = Array.prototype.slice.call(tagNodes);
            expect(Object.keys(existingTags)).toHaveLength(0);

            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });

  describe("deferred tags", () => {
    beforeEach(() => {
      window.__spy__ = sinon.spy();
    });

    afterEach(() => {
      delete window.__spy__;
    });

    it("executes synchronously when defer={true} and async otherwise", (done) => {
      ReactDOM.render(
        <div>
          <Helmet
            defer={false}
            script={[
              {
                innerHTML: `window.__spy__(1)`,
              },
            ]}
          />
          <Helmet
            script={[
              {
                innerHTML: `window.__spy__(2)`,
              },
            ]}
          />
        </div>,
        container
      );

      expect(window.__spy__.callCount).toBe(1);

      requestAnimationFrame(() => {
        try {
          expect(window.__spy__.callCount).toBe(2);
          expect(window.__spy__.args).toEqual([[1], [2]]);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("server", () => {
    const stringifiedHtmlAttributes = `lang="ga" class="myClassName"`;
    const stringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">Dangerous &lt;script&gt; include</title>`;
    const unEncodedStringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">This is text and & and '.</title>`;
    const stringifiedTitleWithItemprop = `<title ${HELMET_ATTRIBUTE}="true" itemprop="name">Title with Itemprop</title>`;
    // Separate itemprop string for the server - Per https://github.com/facebook/react/issues/12403 the server renders HTML Microdata as camel case
    const stringifiedTitleWithItempropFromServer = `<title ${HELMET_ATTRIBUTE}="true" itemProp="name">Title with Itemprop</title>`;
    const stringifiedBaseTag = `<base ${HELMET_ATTRIBUTE}="true" target="_blank" href="http://localhost/"/>`;

    const stringifiedMetaTags = [
      `<meta ${HELMET_ATTRIBUTE}="true" charset="utf-8"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description &amp; encoding of special characters like &#x27; &quot; &gt; &lt; \`"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" itemprop="name" content="Test name itemprop"/>`,
    ].join("");
    // Separate string for charset and itemprop for the server - Per https://github.com/facebook/react/issues/12403 the server renders HTML Microdata as camel case
    const stringifiedMetaTagsFromServer = [
      `<meta ${HELMET_ATTRIBUTE}="true" charSet="utf-8"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description &amp; encoding of special characters like &#x27; &quot; &gt; &lt; \`"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article"/>`,
      `<meta ${HELMET_ATTRIBUTE}="true" itemProp="name" content="Test name itemprop"/>`,
    ].join("");

    const stringifiedLinkTags = [
      `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/helmet" rel="canonical"/>`,
      `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/style.css" rel="stylesheet" type="text/css"/>`,
    ].join("");

    const stringifiedScriptTags = [
      `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript"></script>`,
      `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test2.js" type="text/javascript"></script>`,
    ].join("");

    const stringifiedNoscriptTags = [
      `<noscript ${HELMET_ATTRIBUTE}="true" id="foo"><link rel="stylesheet" type="text/css" href="/style.css" /></noscript>`,
      `<noscript ${HELMET_ATTRIBUTE}="true" id="bar"><link rel="stylesheet" type="text/css" href="/style2.css" /></noscript>`,
    ].join("");

    const stringifiedStyleTags = [
      `<style ${HELMET_ATTRIBUTE}="true" type="text/css">body {background-color: green;}</style>`,
      `<style ${HELMET_ATTRIBUTE}="true" type="text/css">p {font-size: 12px;}</style>`,
    ].join("");

    beforeAll(() => {
      Helmet.canUseDOM = false;
    });

    it("provides initial values if no state is found", () => {
      let head = Helmet.rewind();
      head = Helmet.rewind();

      expect(head.meta).toBeDefined();
      expect(head.meta).toHaveProperty("toString");

      expect(head.meta.toString()).toBe("");
    });

    it("encodes special characters in title", () => {
      ReactDOM.render(<Helmet title="Dangerous <script> include" />, container);

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");

      expect(head.title.toString()).toBe(stringifiedTitle);
    });

    it("opts out of string encoding", () => {
      ReactDOM.render(
        <Helmet
          encodeSpecialCharacters={false}
          title={"This is text and & and '."}
        />,
        container
      );

      const head = Helmet.rewind();
      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");

      expect(head.title.toString()).toBe(unEncodedStringifiedTitle);
    });

    it("renders title as React component", () => {
      ReactDOM.render(
        <Helmet title={"Dangerous <script> include"} />,
        container
      );

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toComponent");

      const titleComponent = head.title.toComponent();

      expect(Array.isArray(titleComponent)).toBe(true);
      expect(titleComponent).toHaveLength(1);

      titleComponent.forEach((title: $FIXME) => {
        expect(title).toBeInstanceOf(Object);
        expect(title).toHaveProperty("type", "title");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{titleComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedTitle}</div>`);
    });

    it("renders title with itemprop name as React component", () => {
      ReactDOM.render(
        <Helmet
          title={"Title with Itemprop"}
          titleAttributes={{ itemprop: "name" }}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toComponent");

      const titleComponent = head.title.toComponent();

      expect(Array.isArray(titleComponent)).toBe(true);
      expect(titleComponent).toHaveLength(1);

      titleComponent.forEach((title: $FIXME) => {
        expect(title).toBeInstanceOf(Object);
        expect(title).toHaveProperty("type", "title");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{titleComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(
        `<div>${stringifiedTitleWithItempropFromServer}</div>`
      );
    });

    it("renders base tag as React component", () => {
      ReactDOM.render(
        <Helmet base={{ target: "_blank", href: "http://localhost/" }} />,
        container
      );

      const head = Helmet.rewind();

      expect(head.base).toBeDefined();
      expect(head.base).toHaveProperty("toComponent");

      const baseComponent = head.base.toComponent();

      expect(Array.isArray(baseComponent)).toBe(true);
      expect(baseComponent).toHaveLength(1);

      baseComponent.forEach((base: $FIXME) => {
        expect(base).toBeInstanceOf(Object);
        expect(base).toHaveProperty("type", "base");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{baseComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedBaseTag}</div>`);
    });

    it("renders meta tags as React components", () => {
      ReactDOM.render(
        <Helmet
          meta={[
            { charset: "utf-8" },
            {
              name: "description",
              content:
                "Test description & encoding of special characters like ' \" > < `",
            },
            { "http-equiv": "content-type", content: "text/html" },
            { property: "og:type", content: "article" },
            { itemprop: "name", content: "Test name itemprop" },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.meta).toBeDefined();
      expect(head.meta).toHaveProperty("toComponent");

      const metaComponent = head.meta.toComponent();

      expect(Array.isArray(metaComponent)).toBe(true);
      expect(metaComponent).toHaveLength(5);

      metaComponent.forEach((meta: $FIXME) => {
        expect(meta).toBeInstanceOf(Object);
        expect(meta).toHaveProperty("type", "meta");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{metaComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedMetaTagsFromServer}</div>`);
    });

    it("renders link tags as React components", () => {
      ReactDOM.render(
        <Helmet
          link={[
            { href: "http://localhost/helmet", rel: "canonical" },
            {
              href: "http://localhost/style.css",
              rel: "stylesheet",
              type: "text/css",
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.link).toBeDefined();
      expect(head.link).toHaveProperty("toComponent");

      const linkComponent = head.link.toComponent();

      expect(Array.isArray(linkComponent)).toBe(true);
      expect(linkComponent).toHaveLength(2);

      linkComponent.forEach((link: $FIXME) => {
        expect(link).toBeInstanceOf(Object);
        expect(link).toHaveProperty("type", "link");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{linkComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedLinkTags}</div>`);
    });

    it("renders script tags as React components", () => {
      ReactDOM.render(
        <Helmet
          script={[
            {
              src: "http://localhost/test.js",
              type: "text/javascript",
            },
            {
              src: "http://localhost/test2.js",
              type: "text/javascript",
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.script).toBeDefined();
      expect(head.script).toHaveProperty("toComponent");

      const scriptComponent = head.script.toComponent();

      expect(Array.isArray(scriptComponent)).toBe(true);
      expect(scriptComponent).toHaveLength(2);

      scriptComponent.forEach((script: $FIXME) => {
        expect(script).toBeInstanceOf(Object);
        expect(script).toHaveProperty("type", "script");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{scriptComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedScriptTags}</div>`);
    });

    it("renders noscript tags as React components", () => {
      ReactDOM.render(
        <Helmet
          noscript={[
            {
              id: "foo",
              innerHTML:
                '<link rel="stylesheet" type="text/css" href="/style.css" />',
            },
            {
              id: "bar",
              innerHTML:
                '<link rel="stylesheet" type="text/css" href="/style2.css" />',
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.noscript).toBeDefined();
      expect(head.noscript).toHaveProperty("toComponent");

      const noscriptComponent = head.noscript.toComponent();

      expect(Array.isArray(noscriptComponent)).toBe(true);
      expect(noscriptComponent).toHaveLength(2);

      noscriptComponent.forEach((noscript: $FIXME) => {
        expect(noscript).toBeInstanceOf(Object);
        expect(noscript).toHaveProperty("type", "noscript");
      });

      const markup = ReactServer.renderToStaticMarkup(
        <div>{noscriptComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedNoscriptTags}</div>`);
    });

    it("renders style tags as React components", () => {
      ReactDOM.render(
        <Helmet
          style={[
            {
              type: "text/css",
              cssText: `body {background-color: green;}`,
            },
            {
              type: "text/css",
              cssText: `p {font-size: 12px;}`,
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.style).toBeDefined();
      expect(head.style).toHaveProperty("toComponent");

      const styleComponent = head.style.toComponent();

      expect(Array.isArray(styleComponent)).toBe(true);
      expect(styleComponent).toHaveLength(2);

      const markup = ReactServer.renderToStaticMarkup(
        <div>{styleComponent}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<div>${stringifiedStyleTags}</div>`);
    });

    it("renders title tag as string", () => {
      ReactDOM.render(
        <Helmet title={"Dangerous <script> include"} />,
        container
      );

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");

      expect(typeof head.title.toString()).toBe("string");
      expect(head.title.toString()).toBe(stringifiedTitle);
    });

    it("renders title with itemprop name as string", () => {
      ReactDOM.render(
        <Helmet
          title={"Title with Itemprop"}
          titleAttributes={{ itemprop: "name" }}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");

      const titleString = head.title.toString();
      expect(typeof titleString).toBe("string");
      expect(titleString).toBe(stringifiedTitleWithItemprop);
    });

    it("renders base tags as string", () => {
      ReactDOM.render(
        <Helmet base={{ target: "_blank", href: "http://localhost/" }} />,
        container
      );

      const head = Helmet.rewind();

      expect(head.base).toBeDefined();
      expect(head.base).toHaveProperty("toString");

      expect(typeof head.base.toString()).toBe("string");
      expect(head.base.toString()).toBe(stringifiedBaseTag);
    });

    it("renders meta tags as string", () => {
      ReactDOM.render(
        <Helmet
          meta={[
            { charset: "utf-8" },
            {
              name: "description",
              content:
                "Test description & encoding of special characters like ' \" > < `",
            },
            { "http-equiv": "content-type", content: "text/html" },
            { property: "og:type", content: "article" },
            { itemprop: "name", content: "Test name itemprop" },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.meta).toBeDefined();
      expect(head.meta).toHaveProperty("toString");

      expect(typeof head.meta.toString()).toBe("string");
      expect(head.meta.toString()).toBe(stringifiedMetaTags);
    });

    it("renders link tags as string", () => {
      ReactDOM.render(
        <Helmet
          link={[
            { href: "http://localhost/helmet", rel: "canonical" },
            {
              href: "http://localhost/style.css",
              rel: "stylesheet",
              type: "text/css",
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.link).toBeDefined();
      expect(head.link).toHaveProperty("toString");

      expect(typeof head.link.toString()).toBe("string");
      expect(head.link.toString()).toBe(stringifiedLinkTags);
    });

    it("renders script tags as string", () => {
      ReactDOM.render(
        <Helmet
          script={[
            {
              src: "http://localhost/test.js",
              type: "text/javascript",
            },
            {
              src: "http://localhost/test2.js",
              type: "text/javascript",
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.script).toBeDefined();
      expect(head.script).toHaveProperty("toString");

      expect(typeof head.script.toString()).toBe("string");
      expect(head.script.toString()).toBe(stringifiedScriptTags);
    });

    it("renders style tags as string", () => {
      ReactDOM.render(
        <Helmet
          style={[
            {
              type: "text/css",
              cssText: `body {background-color: green;}`,
            },
            {
              type: "text/css",
              cssText: `p {font-size: 12px;}`,
            },
          ]}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.style).toBeDefined();
      expect(head.style).toHaveProperty("toString");

      expect(typeof head.style.toString()).toBe("string");
      expect(head.style.toString()).toBe(stringifiedStyleTags);
    });

    it("renders html attributes as component", () => {
      ReactDOM.render(
        <Helmet
          htmlAttributes={{
            lang: "ga",
            className: "myClassName",
          }}
        />,
        container
      );

      const { htmlAttributes } = Helmet.rewind();
      const attrs = htmlAttributes.toComponent();

      expect(attrs).toBeDefined();

      const markup = ReactServer.renderToStaticMarkup(
        <html lang="en" {...attrs} />
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(`<html ${stringifiedHtmlAttributes}></html>`);
    });

    it("renders html attributes as string", () => {
      ReactDOM.render(
        <Helmet
          htmlAttributes={{
            lang: "ga",
            class: "myClassName",
          }}
        />,
        container
      );

      const head = Helmet.rewind();

      expect(head.htmlAttributes).toBeDefined();
      expect(head.htmlAttributes).toHaveProperty("toString");

      expect(typeof head.htmlAttributes.toString()).toBe("string");
      expect(head.htmlAttributes.toString()).toBe(stringifiedHtmlAttributes);
    });

    it("does not encode all characters with HTML character entity equivalents", () => {
      const chineseTitle = "膣膗 鍆錌雔";
      const stringifiedChineseTitle = `<title ${HELMET_ATTRIBUTE}="true">${chineseTitle}</title>`;

      ReactDOM.render(
        <div>
          <Helmet title={chineseTitle} />
        </div>,
        container
      );

      const head = Helmet.rewind();

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");

      expect(typeof head.title.toString()).toBe("string");
      expect(head.title.toString()).toBe(stringifiedChineseTitle);
    });

    it("rewind() provides a fallback object for empty Helmet state", () => {
      ReactDOM.render(<div />, container);

      const head = Helmet.rewind();

      expect(head.htmlAttributes).toBeDefined();
      expect(head.htmlAttributes).toHaveProperty("toString");
      expect(head.htmlAttributes.toString()).toBe("");
      expect(head.htmlAttributes).toHaveProperty("toComponent");
      expect(head.htmlAttributes.toComponent()).toEqual({});

      expect(head.title).toBeDefined();
      expect(head.title).toHaveProperty("toString");
      expect(head.title.toString()).toBe(
        `<title ${HELMET_ATTRIBUTE}="true"></title>`
      );
      expect(head.title).toHaveProperty("toComponent");

      const markup = ReactServer.renderToStaticMarkup(
        <div>{head.title.toComponent()}</div>
      );

      expect(typeof markup).toBe("string");
      expect(markup).toBe(
        `<div><title ${HELMET_ATTRIBUTE}="true"></title></div>`
      );

      expect(head.base).toBeDefined();
      expect(head.base).toHaveProperty("toString");
      expect(head.base.toString()).toBe("");
      expect(head.base).toHaveProperty("toComponent");
      expect(head.base.toComponent()).toEqual([]);

      expect(head.meta).toBeDefined();
      expect(head.meta).toHaveProperty("toString");
      expect(head.meta.toString()).toBe("");
      expect(head.meta).toHaveProperty("toComponent");
      expect(head.meta.toComponent()).toEqual([]);

      expect(head.link).toBeDefined();
      expect(head.link).toHaveProperty("toString");
      expect(head.link.toString()).toBe("");
      expect(head.link).toHaveProperty("toComponent");
      expect(head.link.toComponent()).toEqual([]);

      expect(head.script).toBeDefined();
      expect(head.script).toHaveProperty("toString");
      expect(head.script.toString()).toBe("");
      expect(head.script).toHaveProperty("toComponent");
      expect(head.script.toComponent()).toEqual([]);

      expect(head.noscript).toBeDefined();
      expect(head.noscript).toHaveProperty("toString");
      expect(head.noscript.toString()).toBe("");
      expect(head.noscript).toHaveProperty("toComponent");
      expect(head.noscript.toComponent()).toEqual([]);

      expect(head.style).toBeDefined();
      expect(head.style).toHaveProperty("toString");
      expect(head.style.toString()).toBe("");
      expect(head.style).toHaveProperty("toComponent");
      expect(head.style.toComponent()).toEqual([]);
    });

    it("does not render undefined attribute values", () => {
      ReactDOM.render(
        <Helmet
          script={[
            {
              src: "foo.js",
              async: undefined,
            },
          ]}
        />,
        container
      );

      const { script } = Helmet.rewind();
      const stringifiedScriptTag = script.toString();

      expect(typeof stringifiedScriptTag).toBe("string");
      expect(stringifiedScriptTag).toBe(
        `<script ${HELMET_ATTRIBUTE}="true" src="foo.js" async></script>`
      );
    });
    afterAll(() => {
      Helmet.canUseDOM = true;
    });
  });

  describe("misc", () => {
    it("throws in rewind() when a DOM is present", () => {
      ReactDOM.render(<Helmet title={"Fancy title"} />, container);

      expect(Helmet.rewind).toThrowError(
        "You may only call rewind() on the server. Call peek() to read the current state."
      );
    });

    it("lets you read current state in peek() whether or not a DOM is present", (done) => {
      ReactDOM.render(<Helmet title={"Fancy title"} />, container);

      requestAnimationFrame(() => {
        try {
          expect(Helmet.peek().title).toBe("Fancy title");
          Helmet.canUseDOM = false;
          expect(Helmet.peek().title).toBe("Fancy title");
          Helmet.canUseDOM = true;

          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("encodes special characters", (done) => {
      ReactDOM.render(
        <Helmet
          meta={[
            {
              name: "description",
              content: 'This is "quoted" text and & and \'.',
            },
          ]}
        />,
        container
      );

      requestAnimationFrame(() => {
        try {
          const existingTags = headElement.querySelectorAll(
            `meta[${HELMET_ATTRIBUTE}]`
          );
          const existingTag = existingTags[0];

          expect(existingTags).toBeDefined();

          expect(existingTags.length).toBe(1);

          expect(existingTags.length).toBeGreaterThanOrEqual(0);
          expect(existingTags[0]).toBeInstanceOf(Element);
          expect(existingTag).toHaveProperty("getAttribute");
          expect(existingTag.getAttribute("name")).toBe("description");
          expect(existingTag.getAttribute("content")).toBe(
            'This is "quoted" text and & and \'.'
          );
          expect(existingTag.outerHTML).toBe(
            `<meta name="description" content="This is &quot;quoted&quot; text and &amp; and '." ${HELMET_ATTRIBUTE}="true">`
          );

          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("does not change the DOM if it receives identical props", (done) => {
      const spy = sinon.spy();
      ReactDOM.render(
        <Helmet
          meta={[{ name: "description", content: "Test description" }]}
          title={"Test Title"}
          onChangeClientState={spy}
        />,
        container
      );

      requestAnimationFrame(() => {
        try {
          // Re-rendering will pass new props to an already mounted Helmet
          ReactDOM.render(
            <Helmet
              meta={[{ name: "description", content: "Test description" }]}
              title={"Test Title"}
              onChangeClientState={spy}
            />,
            container
          );

          requestAnimationFrame(() => {
            try {
              expect(spy.callCount).toBe(1);

              done();
            } catch (e) {
              done(e);
            }
          });
        } catch (e) {
          done(e);
        }
      });
    });

    it("does not write the DOM if the client and server are identical", (done) => {
      headElement.innerHTML = `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript" />`;

      const spy = sinon.spy();
      ReactDOM.render(
        <Helmet
          script={[
            {
              src: "http://localhost/test.js",
              type: "text/javascript",
            },
          ]}
          onChangeClientState={spy}
        />,
        container
      );

      requestAnimationFrame(() => {
        try {
          expect(spy.called).toBe(true);

          const [, addedTags, removedTags] = spy.getCall(0).args;

          expect(Object.keys(addedTags)).toHaveLength(0);
          expect(Object.keys(removedTags)).toHaveLength(0);

          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("only adds new tags and preserves tags when rendering additional Helmet instances", (done) => {
      const spy = sinon.spy();
      let addedTags;
      let removedTags;
      ReactDOM.render(
        <Helmet
          link={[
            {
              href: "http://localhost/style.css",
              rel: "stylesheet",
              type: "text/css",
            },
          ]}
          meta={[{ name: "description", content: "Test description" }]}
          onChangeClientState={spy}
        />,
        container
      );

      requestAnimationFrame(() => {
        try {
          expect(spy.called).toBe(true);
          addedTags = spy.getCall(0).args[1];
          removedTags = spy.getCall(0).args[2];

          expect(addedTags).toHaveProperty("metaTags");
          expect(addedTags.metaTags.length).toBeGreaterThanOrEqual(0);
          expect(addedTags.metaTags[0].outerHTML).toBe(
            `<meta name="description" content="Test description" data-react-helmet="true">`
          );
          expect(addedTags).toHaveProperty("linkTags");
          expect(addedTags.linkTags.length).toBeGreaterThanOrEqual(0);
          expect(addedTags.linkTags[0].outerHTML).toBe(
            `<link href="http://localhost/style.css" rel="stylesheet" type="text/css" data-react-helmet="true">`
          );
          expect(Object.keys(removedTags)).toHaveLength(0);

          // Re-rendering will pass new props to an already mounted Helmet
          ReactDOM.render(
            <Helmet
              link={[
                {
                  href: "http://localhost/style.css",
                  rel: "stylesheet",
                  type: "text/css",
                },
                {
                  href: "http://localhost/style2.css",
                  rel: "stylesheet",
                  type: "text/css",
                },
              ]}
              meta={[{ name: "description", content: "New description" }]}
              onChangeClientState={spy}
            />,
            container
          );

          requestAnimationFrame(() => {
            try {
              expect(spy.callCount).toBe(2);
              addedTags = spy.getCall(1).args[1];
              removedTags = spy.getCall(1).args[2];

              expect(addedTags).toHaveProperty("metaTags");
              expect(addedTags.metaTags.length).toBeGreaterThanOrEqual(0);
              expect(addedTags.metaTags[0].outerHTML).toBe(
                `<meta name="description" content="New description" data-react-helmet="true">`
              );
              expect(addedTags).toHaveProperty("linkTags");
              expect(addedTags.linkTags.length).toBeGreaterThanOrEqual(0);
              expect(addedTags.linkTags[0].outerHTML).toBe(
                `<link href="http://localhost/style2.css" rel="stylesheet" type="text/css" data-react-helmet="true">`
              );
              expect(removedTags).toHaveProperty("metaTags");
              expect(removedTags.metaTags.length).toBeGreaterThanOrEqual(0);
              expect(removedTags.metaTags[0].outerHTML).toBe(
                `<meta name="description" content="Test description" data-react-helmet="true">`
              );
              expect(removedTags).not.toHaveProperty("linkTags");

              done();
            } catch (e) {
              done(e);
            }
          });
        } catch (e) {
          done(e);
        }
      });
    });

    it("does not accept nested Helmets", (done) => {
      const warn = sinon.stub(console, "warn");

      ReactDOM.render(
        <Helmet title={"Test Title"}>
          <Helmet title={"Title you'll never see"} />
        </Helmet>,
        container
      );

      requestAnimationFrame(() => {
        try {
          expect(document.title).toBe("Test Title");
          expect(warn.called).toBe(true);

          const [warning] = warn.getCall(0).args;
          expect(warning).toBe(
            "You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information."
          );

          warn.restore();
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("recognizes valid tags regardless of attribute ordering", (done) => {
      ReactDOM.render(
        <Helmet
          meta={[{ content: "Test Description", name: "description" }]}
        />,
        container
      );

      requestAnimationFrame(() => {
        try {
          const existingTags = headElement.querySelectorAll(
            `meta[${HELMET_ATTRIBUTE}]`
          );
          const existingTag = existingTags[0];

          expect(existingTags).toBeDefined();

          expect(existingTags.length).toBe(1);

          expect(existingTags.length).toBeGreaterThanOrEqual(0);
          expect(existingTags[0]).toBeInstanceOf(Element);
          expect(existingTag).toHaveProperty("getAttribute");
          expect(existingTag.getAttribute("name")).toBe("description");
          expect(existingTag.getAttribute("content")).toBe("Test Description");
          expect(existingTag.outerHTML).toBe(
            `<meta content="Test Description" name="description" ${HELMET_ATTRIBUTE}="true">`
          );

          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("requestAnimationFrame works as expected", (done) => {
      requestAnimationFrame((cb: $FIXME) => {
        try {
          expect(cb).toBeDefined();
          expect(typeof cb).toBe("number");

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
