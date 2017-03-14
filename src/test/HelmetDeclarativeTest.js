/* eslint max-nested-callbacks: [1, 5] */
/* eslint-disable react/jsx-sort-props */

import React from "react";
import ReactDOM from "react-dom";
import ReactServer from "react-dom/server";
import Helmet from "../Helmet";

const HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", () => {
    let headElement;

    const container = document.createElement("div");

    beforeEach(() => {
        headElement = headElement || document.head || document.querySelector("head");
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
    });

    describe("api", () => {
        describe("title", () => {
            it("can update page title", () => {
                ReactDOM.render(
                    <Helmet
                        defaultTitle={"Fallback"}
                    >
                        <title>Test Title</title>
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("Test Title");
            });

            it("can update page title with multiple children", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <title>Test Title</title>
                        </Helmet>
                        <Helmet>
                            <title>Child One Title</title>
                        </Helmet>
                        <Helmet>
                            <title>Child Two Title</title>
                        </Helmet>
                    </div>,
                    container
                );

                expect(document.title).to.equal("Child Two Title");
            });

            it("will set title based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <title>Main Title</title>
                        </Helmet>
                        <Helmet>
                            <title>Nested Title</title>
                        </Helmet>
                    </div>,
                    container
                );

                expect(document.title).to.equal("Nested Title");
            });

            it("will set title using deepest nested component with a defined title", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <title>Main Title</title>
                        </Helmet>
                        <Helmet />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Main Title");
            });

            it("will use defaultTitle if no title is defined", () => {
                ReactDOM.render(
                    <Helmet
                        defaultTitle={"Fallback"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    >
                        <title />
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("Fallback");
            });

            it("will use a titleTemplate if defined", () => {
                ReactDOM.render(
                    <Helmet
                        defaultTitle={"Fallback"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    >
                        <title>Test</title>
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature");
            });

            it("will replace multiple title strings in titleTemplate", () => {
                ReactDOM.render(
                    <Helmet
                        titleTemplate={"This is a %s of the titleTemplate feature. Another %s."}
                    >
                        <title>Test</title>
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature. Another Test.");
            });

            it("will use a titleTemplate based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            titleTemplate={"This is a %s of the titleTemplate feature"}
                        >
                            <title>Test</title>
                        </Helmet>
                        <Helmet
                            titleTemplate={"A %s using nested titleTemplate attributes"}
                        >
                            <title>Second Test</title>
                        </Helmet>
                    </div>,
                    container
                );

                expect(document.title).to.equal("A Second Test using nested titleTemplate attributes");
            });

            it("will merge deepest component title with nearest upstream titleTemplate", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            titleTemplate={"This is a %s of the titleTemplate feature"}
                        >
                            <title>Test</title>
                        </Helmet>
                        <Helmet>
                            <title>Second Test</title>
                        </Helmet>
                    </div>,
                    container
                );

                expect(document.title).to.equal("This is a Second Test of the titleTemplate feature");
            });

            it("will render dollar characters in a title correctly when titleTemplate present", () => {
                const dollarTitle = "te$t te$$t te$$$t te$$$$t";

                ReactDOM.render(
                    <Helmet
                        titleTemplate={"This is a %s"}
                    >
                        <title>{dollarTitle}</title>
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("This is a te$t te$$t te$$$t te$$$$t");
            });

            it("will not encode all characters with HTML character entity equivalents", () => {
                const chineseTitle = "膣膗 鍆錌雔";

                ReactDOM.render(
                    <Helmet>
                        <title>{chineseTitle}</title>
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal(chineseTitle);
            });

            it("page tite with prop itemprop", () => {
                ReactDOM.render(
                    <Helmet
                        defaultTitle={"Fallback"}
                        titleAttributes={{itemprop: "name"}}
                    >
                        <title>Test Title with itemProp</title>
                    </Helmet>,
                    container
                );

                const titleTag = document.getElementsByTagName("title")[0];
                expect(document.title).to.equal("Test Title with itemProp");
                expect(titleTag.getAttribute("itemprop")).to.equal("name");
            });
        });

        describe("title attributes", () => {
            it("update title attributes", () => {
                ReactDOM.render(
                    <Helmet>
                        <title itemProp="name" />
                    </Helmet>,
                    container
                );

                const titleTag = document.getElementsByTagName("title")[0];

                expect(titleTag.getAttribute("itemprop")).to.equal("name");
                expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("itemprop");
            });

            it("set attributes based on the deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <title lang="en" hidden />
                        </Helmet>
                        <Helmet>
                            <title lang="ja" />
                        </Helmet>
                    </div>,
                    container
                );

                const titleTag = document.getElementsByTagName("title")[0];

                expect(titleTag.getAttribute("lang")).to.equal("ja");
                expect(titleTag.getAttribute("hidden")).to.equal("");
                expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("lang,hidden");
            });

            it("handle valueless attributes", () => {
                ReactDOM.render(
                    <Helmet>
                        <title hidden />
                    </Helmet>,
                    container
                );

                const titleTag = document.getElementsByTagName("title")[0];

                expect(titleTag.getAttribute("hidden")).to.equal("");
                expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("hidden");
            });

            it("clears title attributes that are handled within helmet", () => {
                ReactDOM.render(
                    <Helmet>
                        <title lang="en" hidden />
                    </Helmet>,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const titleTag = document.getElementsByTagName("title")[0];

                expect(titleTag.getAttribute("lang")).to.be.null;
                expect(titleTag.getAttribute("hidden")).to.be.null;
                expect(titleTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
            });
        });

        describe("html attributes", () => {
            it("update html attributes", () => {
                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "class": "myClassName",
                            "lang": "en"
                        }}
                    />,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("class")).to.equal("myClassName");
                expect(htmlTag.getAttribute("lang")).to.equal("en");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("class,lang");
            });

            it("set attributes based on the deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            htmlAttributes={{
                                "lang": "en"
                            }}
                        />
                        <Helmet
                            htmlAttributes={{
                                "lang": "ja"
                            }}
                        />
                    </div>,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("lang")).to.equal("ja");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("lang");
            });

            it("handle valueless attributes", () => {
                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "amp": undefined
                        }}
                    />,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("amp")).to.equal("");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("amp");
            });

            it("clears html attributes that are handled within helmet", () => {
                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "lang": "en",
                            "amp": undefined
                        }}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("lang")).to.be.null;
                expect(htmlTag.getAttribute("amp")).to.be.null;
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
            });

            it("updates with multiple additions and removals - overwrite and new", () => {
                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "lang": "en",
                            "amp": undefined
                        }}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "lang": "ja",
                            "id": "html-tag",
                            "title": "html tag"
                        }}
                    />,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("amp")).to.equal(null);
                expect(htmlTag.getAttribute("lang")).to.equal("ja");
                expect(htmlTag.getAttribute("id")).to.equal("html-tag");
                expect(htmlTag.getAttribute("title")).to.equal("html tag");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("lang,amp,id,title");
            });

            it("updates with multiple additions and removals - all new", () => {
                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "lang": "en",
                            "amp": undefined
                        }}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet
                        htmlAttributes={{
                            "id": "html-tag",
                            "title": "html tag"
                        }}
                    />,
                    container
                );

                const htmlTag = document.getElementsByTagName("html")[0];

                expect(htmlTag.getAttribute("amp")).to.equal(null);
                expect(htmlTag.getAttribute("lang")).to.equal(null);
                expect(htmlTag.getAttribute("id")).to.equal("html-tag");
                expect(htmlTag.getAttribute("title")).to.equal("html tag");
                expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("lang,amp,id,title");
            });

            context("initialized outside of helmet", () => {
                before(() => {
                    const htmlTag = document.getElementsByTagName("html")[0];
                    htmlTag.setAttribute("test", "test");
                });

                it("will not be cleared", () => {
                    ReactDOM.render(
                        <Helmet />,
                        container
                    );

                    const htmlTag = document.getElementsByTagName("html")[0];

                    expect(htmlTag.getAttribute("test")).to.equal("test");
                    expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
                });

                it("will be overwritten if specified in helmet", () => {
                    ReactDOM.render(
                        <Helmet
                            htmlAttributes={{
                                "test": "helmet-attr"
                            }}
                        />,
                        container
                    );

                    const htmlTag = document.getElementsByTagName("html")[0];

                    expect(htmlTag.getAttribute("test")).to.equal("helmet-attr");
                    expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal("test");
                });

                it("can be cleared once it is managed in helmet", () => {
                    ReactDOM.render(
                        <Helmet
                            htmlAttributes={{
                                "test": "helmet-attr"
                            }}
                        />,
                        container
                    );

                    ReactDOM.render(
                        <Helmet />,
                        container
                    );

                    const htmlTag = document.getElementsByTagName("html")[0];

                    expect(htmlTag.getAttribute("test")).to.equal(null);
                    expect(htmlTag.getAttribute(HELMET_ATTRIBUTE)).to.equal(null);
                });
            });
        });

        describe("onChangeClientState", () => {
            it("when handling client state change, calls the function with new state, addedTags and removedTags ", () => {
                const spy = sinon.spy();
                ReactDOM.render(
                    <div>
                        <Helmet
                            base={{"href": "http://mysite.com/"}}
                            link={[{"href": "http://localhost/helmet", "rel": "canonical"}]}
                            meta={[{"charset": "utf-8"}]}
                            script={[{"src": "http://localhost/test.js", "type": "text/javascript"}]}
                            title={"Main Title"}
                            onChangeClientState={spy}
                        />
                    </div>,
                    container
                );

                expect(spy.called).to.equal(true);
                const newState = spy.getCall(0).args[0];
                const addedTags = spy.getCall(0).args[1];
                const removedTags = spy.getCall(0).args[2];

                expect(newState).to.contain({title: "Main Title"});
                expect(newState.baseTag).to.contain({href: "http://mysite.com/"});
                expect(newState.metaTags).to.contain({"charset": "utf-8"});
                expect(newState.linkTags).to.contain({"href": "http://localhost/helmet", "rel": "canonical"});
                expect(newState.scriptTags).to.contain({"src": "http://localhost/test.js", "type": "text/javascript"});

                expect(addedTags).to.have.property("baseTag");
                expect(addedTags.baseTag).to.have.deep.property("[0]");
                expect(addedTags.baseTag[0].outerHTML).to.equal(`<base href="http://mysite.com/" data-react-helmet="true">`);

                expect(addedTags).to.have.property("metaTags");
                expect(addedTags.metaTags).to.have.deep.property("[0]");
                expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta charset="utf-8" data-react-helmet="true">`);

                expect(addedTags).to.have.property("linkTags");
                expect(addedTags.linkTags).to.have.deep.property("[0]");
                expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/helmet" rel="canonical" data-react-helmet="true">`);

                expect(addedTags).to.have.property("scriptTags");
                expect(addedTags.scriptTags).to.have.deep.property("[0]");
                expect(addedTags.scriptTags[0].outerHTML).to.equal(`<script src="http://localhost/test.js" type="text/javascript" data-react-helmet="true"></script>`);

                expect(removedTags).to.be.empty;
            });

            it("calls the deepest defined callback with the deepest state", () => {
                const spy = sinon.spy();
                ReactDOM.render(
                    <div>
                        <Helmet title={"Main Title"} onChangeClientState={spy} />
                        <Helmet title={"Deeper Title"} />
                    </div>,
                    container
                );

                expect(spy.callCount).to.equal(2);
                expect(spy.getCall(0).args[0]).to.contain({title: "Main Title"});
                expect(spy.getCall(1).args[0]).to.contain({title: "Deeper Title"});
            });
        });

        describe("base tag", () => {
            it("can update base tag", () => {
                ReactDOM.render(
                    <Helmet>
                        <base
                            href="http://mysite.com/"
                        />
                    </Helmet>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return tag.getAttribute("href") === "http://mysite.com/";
                });

                expect(filteredTags.length).to.equal(1);
            });

            it("will clear the base tag if one is not specified", () => {
                ReactDOM.render(
                    <Helmet
                        base={{"href": "http://mysite.com/"}}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'href' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet>
                        <base
                            property="won't work"
                        />
                    </Helmet>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set base tag based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <base
                                href="http://mysite.com"
                            />
                        </Helmet>
                        <Helmet>
                            <base
                                href="http://mysite.com/public"
                            />
                        </Helmet>
                    </div>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
                const firstTag = Array.prototype.slice.call(existingTags)[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("href")).to.equal("http://mysite.com/public");
                expect(firstTag.outerHTML).to.equal(`<base href="http://mysite.com/public" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("won't render tag when primary attribute is null", () => {
                ReactDOM.render(
                    <Helmet>
                        <base
                            href={undefined}
                        />
                    </Helmet>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });
        });

        describe("meta tags", () => {
            it("can update meta tags", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta charSet="utf-8" />
                        <meta
                            name="description"
                            content="Test description"
                        />
                        <meta
                            httpEquiv="content-type"
                            content="text/html"
                        />
                        <meta
                            property="og:type"
                            content="article"
                        />
                        <meta
                            itemProp="name"
                            content="Test name itemprop"
                        />
                    </Helmet>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return tag.getAttribute("charset") === "utf-8" ||
                        (tag.getAttribute("name") === "description" && tag.getAttribute("content") === "Test description") ||
                        (tag.getAttribute("http-equiv") === "content-type" && tag.getAttribute("content") === "text/html") ||
                        (tag.getAttribute("itemprop") === "name" && tag.getAttribute("content") === "Test name itemprop");
                });

                expect(filteredTags.length).to.be.at.least(4);
            });

            it("will clear all meta tags if none are specified", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta
                            name="description"
                            content="Test description"
                        />
                    </Helmet>,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'name', 'http-equiv', 'property', 'charset', or 'itemprop' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta href="won't work" />
                    </Helmet>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set meta tags based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <meta charSet="utf-8" />
                            <meta
                                name="description"
                                content="Test description"
                            />
                        </Helmet>
                        <Helmet>
                            <meta
                                name="description"
                                content="Inner description"
                            />
                            <meta
                                name="keywords"
                                content="test,meta,tags"
                            />
                        </Helmet>
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                const firstTag = existingTags[0];
                const secondTag = existingTags[1];
                const thirdTag = existingTags[2];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(3);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("charset")).to.equal("utf-8");
                expect(firstTag.outerHTML).to.equal(`<meta charset="utf-8" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Inner description");
                expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[2]")
                    .that.is.an.instanceof(Element);
                expect(thirdTag).to.have.property("getAttribute");
                expect(thirdTag.getAttribute("name")).to.equal("keywords");
                expect(thirdTag.getAttribute("content")).to.equal("test,meta,tags");
                expect(thirdTag.outerHTML).to.equal(`<meta name="keywords" content="test,meta,tags" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will allow duplicate meta tags if specified in the same component", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta
                            name="description"
                            content="Test description"
                        />
                        <meta
                            name="description"
                            content="Duplicate description"
                        />
                    </Helmet>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Test description");
                expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Test description" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Duplicate description");
                expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Duplicate description" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will override duplicate meta tags with single meta tag in a nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <meta
                                name="description"
                                content="Test description"
                            />
                            <meta
                                name="description"
                                content="Duplicate description"
                            />
                        </Helmet>
                        <Helmet>
                            <meta
                                name="description"
                                content="Inner description"
                            />
                        </Helmet>
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Inner description");
                expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will override single meta tag with duplicate meta tags in a nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet>
                            <meta
                                name="description"
                                content="Test description"
                            />
                        </Helmet>
                        <Helmet>
                            <meta
                                name="description"
                                content="Inner description"
                            />
                            <meta
                                name="description"
                                content="Inner duplicate description"
                            />
                        </Helmet>
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Inner description");
                expect(firstTag.outerHTML).to.equal(`<meta name="description" content="Inner description" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Inner duplicate description");
                expect(secondTag.outerHTML).to.equal(`<meta name="description" content="Inner duplicate description" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("won't render tag when primary attribute is null", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta
                            name={undefined}
                            content="Inner duplicate description"
                        />
                    </Helmet>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });

            it("fails gracefully when meta is wrong shape", () => {
                ReactDOM.render(
                    <Helmet>
                        <meta
                            name="title"
                            content="some title"
                        />
                    </Helmet>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });
        });

        describe("link tags", () => {
            it("can update link tags", () => {
                ReactDOM.render(
                    <Helmet
                        link={[
                            {"href": "http://localhost/helmet", "rel": "canonical"},
                            {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return (tag.getAttribute("href") === "http://localhost/style.css" && tag.getAttribute("rel") === "stylesheet" && tag.getAttribute("type") === "text/css") ||
                        (tag.getAttribute("href") === "http://localhost/helmet" && tag.getAttribute("rel") === "canonical");
                });

                expect(filteredTags.length).to.be.at.least(2);
            });

            it("will clear all link tags if none are specified", () => {
                ReactDOM.render(
                    <Helmet
                        link={[
                            {"href": "http://localhost/helmet", "rel": "canonical"}
                        ]}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'href' or 'rel' will not be accepted, even if they are valid for other tags", () => {
                ReactDOM.render(
                    <Helmet
                        link={[{"http-equiv": "won't work"}]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags 'rel' and 'href' will properly use 'rel' as the primary identification for this tag, regardless of ordering", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            link={[{"href": "http://localhost/helmet", "rel": "canonical"}]}
                        />
                        <Helmet
                            link={[{"rel": "canonical", "href": "http://localhost/helmet/new"}]}
                        />
                        <Helmet
                            link={[{"href": "http://localhost/helmet/newest", "rel": "canonical"}]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/newest");
                expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/helmet/newest" rel="canonical" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("tags with rel='stylesheet' will use the href as the primary identification of the tag, regardless of ordering", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            link={[
                                {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                            ]}
                        />
                        <Helmet
                            link={[
                                {"rel": "stylesheet", "href": "http://localhost/inner.css", "type": "text/css", "media": "all"}
                            ]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/style.css");
                expect(firstTag.getAttribute("rel")).to.equal("stylesheet");
                expect(firstTag.getAttribute("type")).to.equal("text/css");
                expect(firstTag.getAttribute("media")).to.equal("all");
                expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("rel")).to.equal("stylesheet");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/inner.css");
                expect(secondTag.getAttribute("type")).to.equal("text/css");
                expect(secondTag.getAttribute("media")).to.equal("all");
                expect(secondTag.outerHTML).to.equal(`<link rel="stylesheet" href="http://localhost/inner.css" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will set link tags based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet"},
                                {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                            ]}
                        />
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"},
                                {"href": "http://localhost/inner.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                            ]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];
                const thirdTag = existingTags[2];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.at.least(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/style.css");
                expect(firstTag.getAttribute("rel")).to.equal("stylesheet");
                expect(firstTag.getAttribute("type")).to.equal("text/css");
                expect(firstTag.getAttribute("media")).to.equal("all");
                expect(firstTag.outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[2]")
                    .that.is.an.instanceof(Element);
                expect(thirdTag).to.have.property("getAttribute");
                expect(thirdTag.getAttribute("href")).to.equal("http://localhost/inner.css");
                expect(thirdTag.getAttribute("rel")).to.equal("stylesheet");
                expect(thirdTag.getAttribute("type")).to.equal("text/css");
                expect(thirdTag.getAttribute("media")).to.equal("all");
                expect(thirdTag.outerHTML).to.equal(`<link href="http://localhost/inner.css" rel="stylesheet" type="text/css" media="all" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will allow duplicate link tags if specified in the same component", () => {
                ReactDOM.render(
                    <Helmet
                        link={[
                            {"rel": "canonical", "href": "http://localhost/helmet"},
                            {"rel": "canonical", "href": "http://localhost/helmet/component"}
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.at.least(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet");
                expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/component");
                expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will override duplicate link tags with a single link tag in a nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet"},
                                {"rel": "canonical", "href": "http://localhost/helmet/component"}
                            ]}
                        />
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"}
                            ]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("will override single link tag with duplicate link tags in a nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet"}
                            ]}
                        />
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/component"},
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"}
                            ]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/component");
                expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(secondTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/innercomponent" ${HELMET_ATTRIBUTE}="true">`);
            });

            it("won't render tag when primary attribute is null", () => {
                ReactDOM.render(
                    <Helmet
                        link={[
                            {"rel": "icon", "sizes": "192x192", "href": null},
                            {"rel": "canonical", "href": "http://localhost/helmet/component"}
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.be.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/component");
                expect(firstTag.outerHTML).to.equal(`<link rel="canonical" href="http://localhost/helmet/component" ${HELMET_ATTRIBUTE}="true">`);
            });
        });

        describe("script tags", () => {
            it("can update script tags", () => {
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
                            {"src": "http://localhost/test.js", "type": "text/javascript"},
                            {"src": "http://localhost/test2.js", "type": "text/javascript"},
                            {
                                type: "application/ld+json",
                                innerHTML: scriptInnerHTML
                            }
                        ]}
                    />,
                    container
                );

                const existingTags = headElement.getElementsByTagName("script");

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return (tag.getAttribute("src") === "http://localhost/test.js" && tag.getAttribute("type") === "text/javascript") ||
                        (tag.getAttribute("src") === "http://localhost/test2.js" && tag.getAttribute("type") === "text/javascript") ||
                        (tag.getAttribute("type") === "application/ld+json" && tag.innerHTML === scriptInnerHTML);
                });

                expect(filteredTags.length).to.be.at.least(3);
            });

            it("will clear all scripts tags if none are specified", () => {
                ReactDOM.render(
                    <Helmet
                        script={[
                            {"src": "http://localhost/test.js", "type": "text/javascript"}
                        ]}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'src' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet
                        script={[{"property": "won't work"}]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set script tags based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            script={[
                                {"src": "http://localhost/test.js", "type": "text/javascript"}
                            ]}
                        />
                        <Helmet
                            script={[
                                {"src": "http://localhost/test2.js", "type": "text/javascript"}
                            ]}
                        />
                    </div>,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                const firstTag = existingTags[0];
                const secondTag = existingTags[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.at.least(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("src")).to.equal("http://localhost/test.js");
                expect(firstTag.getAttribute("type")).to.equal("text/javascript");
                expect(firstTag.outerHTML).to.equal(`<script src="http://localhost/test.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("src")).to.equal("http://localhost/test2.js");
                expect(secondTag.getAttribute("type")).to.equal("text/javascript");
                expect(secondTag.outerHTML).to.equal(`<script src="http://localhost/test2.js" type="text/javascript" ${HELMET_ATTRIBUTE}="true"></script>`);
            });


            it("sets undefined attribute values to empty strings", () => {
                ReactDOM.render(
                    <Helmet
                        script={[
                            {
                                src: "foo.js",
                                async: undefined
                            }
                        ]}
                    />,
                    container
                );

                const existingTag = headElement.querySelector(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTag).to.not.equal(undefined);
                expect(existingTag.outerHTML)
                    .to.be.a("string")
                    .that.equals(`<script src="foo.js" async="" ${HELMET_ATTRIBUTE}="true"></script>`);
            });

            it("won't render tag when primary attribute (src) is null", () => {
                ReactDOM.render(
                    <Helmet
                        script={[
                            {
                                src: undefined,
                                type: "text/javascript"
                            }
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });

            it("won't render tag when primary attribute (innerHTML) is null", () => {
                ReactDOM.render(
                    <Helmet
                        script={[
                            {
                                innerHTML: undefined
                            }
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });
        });

        describe("noscript tags", () => {
            it("can update noscript tags", () => {
                const noscriptInnerHTML = `<link rel="stylesheet" type="text/css" href="foo.css" />`;
                ReactDOM.render(
                    <Helmet noscript={[{id: "bar", innerHTML: noscriptInnerHTML}]} />,
                    container
                );

                const existingTags = headElement.getElementsByTagName("noscript");

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(1);
                expect(existingTags[0].innerHTML === noscriptInnerHTML && existingTags[0].id === "bar");
            });

            it("will clear all noscripts tags if none are specified", () => {
                ReactDOM.render(<Helmet noscript={[{id: "bar"}]} />, container);

                ReactDOM.render(<Helmet />, container);

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'innerHTML' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet noscript={[{"property": "won't work"}]} />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("won't render tag when primary attribute is null", () => {
                ReactDOM.render(
                    <Helmet
                        noscript={[
                            {
                                innerHTML: undefined
                            }
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`noscript[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });
        });

        describe("style tags", () => {
            it("can update style tags", () => {
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
                                cssText: cssText1
                            },
                            {
                                cssText: cssText2
                            }
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);

                const [
                    firstTag,
                    secondTag
                ] = existingTags;
                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.be.equal(2);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("type")).to.equal("text/css");
                expect(firstTag.innerHTML).to.equal(cssText1);
                expect(firstTag.outerHTML).to.equal(`<style type="text/css" ${HELMET_ATTRIBUTE}="true">${cssText1}</style>`);

                expect(existingTags)
                    .to.have.deep.property("[1]")
                    .that.is.an.instanceof(Element);
                expect(secondTag.innerHTML).to.equal(cssText2);
                expect(secondTag.outerHTML).to.equal(`<style ${HELMET_ATTRIBUTE}="true">${cssText2}</style>`);
            });

            it("will clear all style tags if none are specified", () => {
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
                                cssText
                            }
                        ]}
                    />,
                    container
                );

                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'cssText' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet
                        style={[{"property": "won't work"}]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("won't render tag when primary attribute is null", () => {
                ReactDOM.render(
                    <Helmet
                        style={[
                            {
                                cssText: undefined
                            }
                        ]}
                    />,
                    container
                );

                const tagNodes = headElement.querySelectorAll(`style[${HELMET_ATTRIBUTE}]`);
                const existingTags = Array.prototype.slice.call(tagNodes);
                expect(existingTags).to.be.empty;
            });
        });
    });

    describe("server", () => {
        const stringifiedHtmlAttributes = `lang="ga" class="myClassName"`;
        const stringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">Dangerous &lt;script&gt; include</title>`;
        const stringifiedTitleWithItemprop = `<title ${HELMET_ATTRIBUTE}="true" itemprop="name">Title with Itemprop</title>`;
        const stringifiedBaseTag = `<base ${HELMET_ATTRIBUTE}="true" target="_blank" href="http://localhost/"/>`;

        const stringifiedMetaTags = [
            `<meta ${HELMET_ATTRIBUTE}="true" charset="utf-8"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description &amp; encoding of special characters like &#x27; &quot; &gt; &lt; \`"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" itemprop="name" content="Test name itemprop"/>`
        ].join("");

        const stringifiedLinkTags = [
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/helmet" rel="canonical"/>`,
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/style.css" rel="stylesheet" type="text/css"/>`
        ].join("");

        const stringifiedScriptTags = [
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript"></script>`,
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test2.js" type="text/javascript"></script>`
        ].join("");

        const stringifiedNoscriptTags = [
            `<noscript ${HELMET_ATTRIBUTE}="true" id="foo"><link rel="stylesheet" type="text/css" href="/style.css" /></noscript>`,
            `<noscript ${HELMET_ATTRIBUTE}="true" id="bar"><link rel="stylesheet" type="text/css" href="/style2.css" /></noscript>`
        ].join("");

        const stringifiedStyleTags = [
            `<style ${HELMET_ATTRIBUTE}="true" type="text/css">body {background-color: green;}</style>`,
            `<style ${HELMET_ATTRIBUTE}="true" type="text/css">p {font-size: 12px;}</style>`
        ].join("");

        before(() => {
            Helmet.canUseDOM = false;
        });

        it("will html encode title", () => {
            ReactDOM.render(
                <Helmet>
                    <title>{`Dangerous <script> include`}</title>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            expect(head.title.toString()).to.equal(stringifiedTitle);
        });

        it("will render title as React component", () => {
            ReactDOM.render(
                <Helmet>
                    <title>{`Dangerous <script> include`}</title>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toComponent");

            const titleComponent = head.title.toComponent();

            expect(titleComponent)
                .to.be.an("array")
                .that.has.length.of(1);

            titleComponent.forEach(title => {
                expect(title)
                    .to.be.an("object")
                    .that.contains.property("type", "title");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {titleComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedTitle
                }</div>`);
        });

        it("will render title with itemprop name as React component", () => {
            ReactDOM.render(
                <Helmet>
                    <title itemProp="name">Title with Itemprop</title>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toComponent");

            const titleComponent = head.title.toComponent();

            expect(titleComponent)
                .to.be.an("array")
                .that.has.length.of(1);

            titleComponent.forEach(title => {
                expect(title)
                    .to.be.an("object")
                    .that.contains.property("type", "title");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {titleComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedTitleWithItemprop
                }</div>`);
        });

        it("will render base tag as React component", () => {
            ReactDOM.render(
                <Helmet>
                    <base target="_blank" href="http://localhost/" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.base).to.exist;
            expect(head.base).to.respondTo("toComponent");

            const baseComponent = head.base.toComponent();

            expect(baseComponent)
                .to.be.an("array")
                .that.has.length.of(1);

            baseComponent.forEach(base => {
                expect(base)
                    .to.be.an("object")
                    .that.contains.property("type", "base");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {baseComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedBaseTag
                }</div>`);
        });

        it("will render meta tags as React components", () => {
            ReactDOM.render(
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="description" content={"Test description & encoding of special characters like ' \" > < `"} />
                    <meta httpEquiv="content-type" content="text/html" />
                    <meta property="og:type" content="article" />
                    <meta itemProp="name" content="Test name itemprop" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.meta).to.exist;
            expect(head.meta).to.respondTo("toComponent");

            const metaComponent = head.meta.toComponent();

            expect(metaComponent)
                .to.be.an("array")
                .that.has.length.of(5);

            metaComponent.forEach(meta => {
                expect(meta)
                    .to.be.an("object")
                    .that.contains.property("type", "meta");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {metaComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedMetaTags
                }</div>`);
        });

        it("will render link tags as React components", () => {
            ReactDOM.render(
                <Helmet>
                    <link href="http://localhost/helmet" rel="canonical" />
                    <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.link).to.exist;
            expect(head.link).to.respondTo("toComponent");

            const linkComponent = head.link.toComponent();

            expect(linkComponent)
                .to.be.an("array")
                .that.has.length.of(2);

            linkComponent.forEach(link => {
                expect(link)
                    .to.be.an("object")
                    .that.contains.property("type", "link");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {linkComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedLinkTags
                }</div>`);
        });

        it("will render script tags as React components", () => {
            ReactDOM.render(
                <Helmet>
                    <script src="http://localhost/test.js" type="text/javascript" />
                    <script src="http://localhost/test2.js" type="text/javascript" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.script).to.exist;
            expect(head.script).to.respondTo("toComponent");

            const scriptComponent = head.script.toComponent();

            expect(scriptComponent)
                .to.be.an("array")
                .that.has.length.of(2);

            scriptComponent.forEach(script => {
                expect(script)
                    .to.be.an("object")
                    .that.contains.property("type", "script");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {scriptComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedScriptTags
                }</div>`);
        });

        it("will render noscript tags as React components", () => {
            ReactDOM.render(
                <Helmet>
                    <noscript id="foo">{`
                        <link rel="stylesheet" type="text/css" href="/style.css" />
                    `}</noscript>,
                    <noscript id="bar">{`
                        <link rel="stylesheet" type="text/css" href="/style2.css" />
                    `}</noscript>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.noscript).to.exist;
            expect(head.noscript).to.respondTo("toComponent");

            const noscriptComponent = head.noscript.toComponent();

            expect(noscriptComponent)
                .to.be.an("array")
                .that.has.length.of(2);

            noscriptComponent.forEach(noscript => {
                expect(noscript)
                    .to.be.an("object")
                    .that.contains.property("type", "noscript");
            });

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {noscriptComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedNoscriptTags
                }</div>`);
        });

        it("will render style tags as React components", () => {
            ReactDOM.render(
                <Helmet>
                    <style type="text/css">{`body {background-color: green;}`}</style>
                    <style type="text/css">{`p {font-size: 12px;}`}</style>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.style).to.exist;
            expect(head.style).to.respondTo("toComponent");

            const styleComponent = head.style.toComponent();

            expect(styleComponent)
                .to.be.an("array")
                .that.has.length.of(2);

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {styleComponent}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedStyleTags
                }</div>`);
        });

        it("will render title tag as string", () => {
            ReactDOM.render(
                <Helmet>
                    <title>{"Dangerous <script> include"}</title>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            expect(head.title.toString())
                .to.be.a("string")
                .that.equals(stringifiedTitle);
        });

        it("will render title with itemprop name as string", () => {
            ReactDOM.render(
                <Helmet>
                    <title itemProp="name">Title with Itemprop</title>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            const titleString = head.title.toString();
            expect(titleString)
                .to.be.a("string")
                .that.equals(stringifiedTitleWithItemprop);
        });

        it("will render base tags as string", () => {
            ReactDOM.render(
                <Helmet>
                    <base target="_blank" href="http://localhost/" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.base).to.exist;
            expect(head.base).to.respondTo("toString");

            expect(head.base.toString())
                .to.be.a("string")
                .that.equals(stringifiedBaseTag);
        });

        it("will render meta tags as string", () => {
            ReactDOM.render(
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="description" content="Test description &amp; encoding of special characters like &#x27; &quot; &gt; &lt; \`" />
                    <meta httpEquiv="content-type" content="text/html" />
                    <meta property="og:type" content="article" />
                    <meta itemProp="name" content="Test name itemprop" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.meta).to.exist;
            expect(head.meta).to.respondTo("toString");

            expect(head.meta.toString())
                .to.be.a("string")
                .that.equals(stringifiedMetaTags);
        });

        it("will render link tags as string", () => {
            ReactDOM.render(
                <Helmet>
                    <link href="http://localhost/helmet" rel="canonical" />
                    <link href="http://localhost/style.css" rel="stylesheet" type="text/css" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.link).to.exist;
            expect(head.link).to.respondTo("toString");

            expect(head.link.toString())
                .to.be.a("string")
                .that.equals(stringifiedLinkTags);
        });

        it("will render script tags as string", () => {
            ReactDOM.render(
                <Helmet>
                    <script src="http://localhost/test.js" type="text/javascript" />
                    <script src="http://localhost/test2.js" type="text/javascript" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.script).to.exist;
            expect(head.script).to.respondTo("toString");

            expect(head.script.toString())
                .to.be.a("string")
                .that.equals(stringifiedScriptTags);
        });

        it("will render style tags as string", () => {
            ReactDOM.render(
                <Helmet>
                    <style type="text/css">{`body {background-color: green;}`}</style>
                    <style type="text/css">{`p {font-size: 12px;}`}</style>
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.style).to.exist;
            expect(head.style).to.respondTo("toString");

            expect(head.style.toString())
                .to.be.a("string")
                .that.equals(stringifiedStyleTags);
        });

        it("will render html attributes as component", () => {
            ReactDOM.render(
                <Helmet>
                    <html lang="ga" className="myClassName" />
                </Helmet>,
                container
            );

            const {htmlAttributes} = Helmet.rewind();
            const attrs = htmlAttributes.toComponent();

            expect(attrs).to.exist;

            const markup = ReactServer.renderToStaticMarkup(
                <html lang="en" {...attrs} />
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<html ${stringifiedHtmlAttributes}></html>`);
        });

        it("will render html attributes as string", () => {
            ReactDOM.render(
                <Helmet>
                    <html lang="ga" className="myClassName" />
                </Helmet>,
                container
            );

            const head = Helmet.rewind();

            expect(head.htmlAttributes).to.exist;
            expect(head.htmlAttributes).to.respondTo("toString");

            expect(head.htmlAttributes.toString())
                .to.be.a("string")
                .that.equals(stringifiedHtmlAttributes);
        });

        it("will not encode all characters with HTML character entity equivalents", () => {
            const chineseTitle = "膣膗 鍆錌雔";
            const stringifiedChineseTitle = `<title ${HELMET_ATTRIBUTE}="true">${chineseTitle}</title>`;

            ReactDOM.render(
                <div>
                    <Helmet>
                        <title>{chineseTitle}</title>
                    </Helmet>
                </div>,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            expect(head.title.toString())
                .to.be.a("string")
                .that.equals(stringifiedChineseTitle);
        });

        it("rewind() provides a fallback object for empty Helmet state", () => {
            ReactDOM.render(
                <div />,
                container
            );

            const head = Helmet.rewind();

            expect(head.htmlAttributes).to.exist;
            expect(head.htmlAttributes).to.respondTo("toString");
            expect(head.htmlAttributes.toString()).to.equal("");
            expect(head.htmlAttributes).to.respondTo("toComponent");
            expect(head.htmlAttributes.toComponent()).to.be.an("object")
                .that.is.empty;

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");
            expect(head.title.toString()).to.equal(`<title ${HELMET_ATTRIBUTE}="true"></title>`);
            expect(head.title).to.respondTo("toComponent");

            const markup = ReactServer.renderToStaticMarkup(
                <div>
                    {head.title.toComponent()}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div><title ${HELMET_ATTRIBUTE}="true"></title></div>`);

            expect(head.base).to.exist;
            expect(head.base).to.respondTo("toString");
            expect(head.base.toString()).to.equal("");
            expect(head.base).to.respondTo("toComponent");
            expect(head.base.toComponent()).to.be.an("array")
                .that.is.empty;

            expect(head.meta).to.exist;
            expect(head.meta).to.respondTo("toString");
            expect(head.meta.toString()).to.equal("");
            expect(head.meta).to.respondTo("toComponent");
            expect(head.meta.toComponent()).to.be.an("array")
                .that.is.empty;

            expect(head.link).to.exist;
            expect(head.link).to.respondTo("toString");
            expect(head.link.toString()).to.equal("");
            expect(head.link).to.respondTo("toComponent");
            expect(head.link.toComponent()).to.be.an("array")
                .that.is.empty;

            expect(head.script).to.exist;
            expect(head.script).to.respondTo("toString");
            expect(head.script.toString()).to.equal("");
            expect(head.script).to.respondTo("toComponent");
            expect(head.script.toComponent()).to.be.an("array")
                .that.is.empty;

            expect(head.noscript).to.exist;
            expect(head.noscript).to.respondTo("toString");
            expect(head.noscript.toString()).to.equal("");
            expect(head.noscript).to.respondTo("toComponent");
            expect(head.noscript.toComponent()).to.be.an("array")
                .that.is.empty;

            expect(head.style).to.exist;
            expect(head.style).to.respondTo("toString");
            expect(head.style.toString()).to.equal("");
            expect(head.style).to.respondTo("toComponent");
            expect(head.style.toComponent()).to.be.an("array")
                .that.is.empty;
        });

        it("does not render undefined attribute values", () => {
            ReactDOM.render(
                <Helmet>
                    <script src="foo.js" async={undefined} />
                </Helmet>,
                container
            );

            const {script} = Helmet.rewind();
            const stringifiedScriptTag = script.toString();

            expect(stringifiedScriptTag)
                .to.be.a("string")
                .that.equals(`<script ${HELMET_ATTRIBUTE}="true" src="foo.js" async></script>`);
        });
        after(() => {
            Helmet.canUseDOM = true;
        });
    });

    describe("misc", () => {
        it("throws in rewind() when a DOM is present", () => {
            ReactDOM.render(
                <Helmet>
                    <title>Fancy title</title>
                </Helmet>,
                container
            );

            expect(Helmet.rewind).to.throw(
                "You may only call rewind() on the server. Call peek() to read the current state."
            );
        });

        it("lets you read current state in peek() whether or not a DOM is present", () => {
            ReactDOM.render(
                <Helmet>
                    <title>Fancy title</title>
                </Helmet>,
                container
            );

            expect(Helmet.peek().title).to.be.equal("Fancy title");
            Helmet.canUseDOM = false;
            expect(Helmet.peek().title).to.be.equal("Fancy title");
            Helmet.canUseDOM = true;
        });

        it("will html encode string", () => {
            ReactDOM.render(
                <Helmet>
                    <meta name="description" content={"This is \"quoted\" text and & and '."} />
                </Helmet>,
                container
            );

            const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
            const existingTag = existingTags[0];

            expect(existingTags).to.not.equal(undefined);

            expect(existingTags.length).to.be.equal(1);

            expect(existingTags)
                .to.have.deep.property("[0]")
                .that.is.an.instanceof(Element);
            expect(existingTag).to.have.property("getAttribute");
            expect(existingTag.getAttribute("name")).to.equal("description");
            expect(existingTag.getAttribute("content")).to.equal("This is \"quoted\" text and & and '.");
            expect(existingTag.outerHTML).to.equal(`<meta name="description" content="This is &quot;quoted&quot; text and &amp; and '." ${HELMET_ATTRIBUTE}="true">`);
        });

        it("will not change the DOM if it is recevies identical props", () => {
            const spy = sinon.spy();
            ReactDOM.render(
                <Helmet onChangeClientState={spy}>
                    <meta
                        name="description"
                        content="Test description"
                    />
                    <title>Test Title</title>
                </Helmet>,
                container
            );

            // Re-rendering will pass new props to an already mounted Helmet
            ReactDOM.render(
                <Helmet
                    onChangeClientState={spy}
                >
                    <meta
                        name="description"
                        content="Test description"
                    />
                    <title>Test Title</title>
                </Helmet>,
                container
            );

            expect(spy.callCount).to.equal(1);
        });

        it("will only add new tags and will perserve tags when rendering additional Helmet instances", () => {
            const spy = sinon.spy();
            let addedTags;
            let removedTags;
            ReactDOM.render(
                <Helmet onChangeClientState={spy}>
                    <link
                        href="http://localhost/style.css"
                        ref="stylesheet"
                        type="text/css"
                    />
                    <meta
                        name="description"
                        content="Test description"
                    />
                </Helmet>,
                container
            );

            expect(spy.called).to.equal(true);
            addedTags = spy.getCall(0).args[1];
            removedTags = spy.getCall(0).args[2];

            expect(addedTags).to.have.property("metaTags");
            expect(addedTags.metaTags).to.have.deep.property("[0]");
            expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="Test description" data-react-helmet="true">`);
            expect(addedTags).to.have.property("linkTags");
            expect(addedTags.linkTags).to.have.deep.property("[0]");
            expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/style.css" rel="stylesheet" type="text/css" data-react-helmet="true">`);
            expect(removedTags).to.be.empty;

            // Re-rendering will pass new props to an already mounted Helmet
            ReactDOM.render(
                <Helmet onChangeClientState={spy}>
                    <link
                        href="http://localhost/style.css"
                        ref="stylesheet"
                        type="text/css"
                    />
                    <link
                        href="http://localhost/style2.css"
                        ref="stylesheet"
                        type="text/css"
                    />
                    <meta
                        name="description"
                        content="New description"
                    />
                </Helmet>
                ,
                container
            );

            expect(spy.callCount).to.equal(2);
            addedTags = spy.getCall(1).args[1];
            removedTags = spy.getCall(1).args[2];

            expect(addedTags).to.have.property("metaTags");
            expect(addedTags.metaTags).to.have.deep.property("[0]");
            expect(addedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="New description" data-react-helmet="true">`);
            expect(addedTags).to.have.property("linkTags");
            expect(addedTags.linkTags).to.have.deep.property("[0]");
            expect(addedTags.linkTags[0].outerHTML).to.equal(`<link href="http://localhost/style2.css" rel="stylesheet" type="text/css" data-react-helmet="true">`);
            expect(removedTags).to.have.property("metaTags");
            expect(removedTags.metaTags).to.have.deep.property("[0]");
            expect(removedTags.metaTags[0].outerHTML).to.equal(`<meta name="description" content="Test description" data-react-helmet="true">`);
            expect(removedTags).to.not.have.property("linkTags");
        });

        it("can not nest Helmets", () => {
            ReactDOM.render(
                <Helmet>
                    <title>Test Title</title>
                    <Helmet>
                        <title>Title you'll never see</title>
                    </Helmet>
                </Helmet>,
                container
            );

            expect(document.title).to.equal("Test Title");
        });

        it("will recognize valid tags regardless of attribute ordering", () => {
            ReactDOM.render(
                <Helmet>
                    <meta
                        content="Test Description"
                        name="description"
                    />
                </Helmet>,
                container
            );

            const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
            const existingTag = existingTags[0];

            expect(existingTags).to.not.equal(undefined);

            expect(existingTags.length).to.be.equal(1);

            expect(existingTags)
                .to.have.deep.property("[0]")
                .that.is.an.instanceof(Element);
            expect(existingTag).to.have.property("getAttribute");
            expect(existingTag.getAttribute("name")).to.equal("description");
            expect(existingTag.getAttribute("content")).to.equal("Test Description");
            expect(existingTag.outerHTML).to.equal(`<meta content="Test Description" name="description" ${HELMET_ATTRIBUTE}="true">`);
        });
    });
});
