/* eslint max-nested-callbacks: [1, 5] */

import React from "react";
import ReactDOM from "react-dom";
import ReactServer from "react-dom/server";
import Helmet from "../index";

const HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", () => {
    var headElement;

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
                    <Helmet title={"Test Title"} />,
                    container
                );

                expect(document.title).to.equal("Test Title");
            });

            it("can update page title with multiple children", () => {
                ReactDOM.render(
                    <div>
                        <Helmet title={"Test Title"} />
                        <Helmet title={"Child One Title"} />
                        <Helmet title={"Child Two Title"} />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Child Two Title");
            });

            it("will set title based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet title={"Main Title"} />
                        <Helmet title={"Nested Title"} />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Nested Title");
            });

            it("will set title using deepest nested component with a defined title", () => {
                ReactDOM.render(
                    <div>
                        <Helmet title={"Main Title"} />
                        <Helmet />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Main Title");
            });

            it("will use a titleTemplate if defined", () => {
                ReactDOM.render(
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    />,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature");
            });

            it("will replace multiple title strings in titleTemplate", () => {
                ReactDOM.render(
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature. Another %s."}
                    />,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature. Another Test.");
            });

            it("will use a titleTemplate based on deepest nested component", () => {
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

                expect(document.title).to.equal("A Second Test using nested titleTemplate attributes");
            });

            it("will merge deepest component title with nearest upstream titleTemplate", () => {
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

                expect(document.title).to.equal("This is a Second Test of the titleTemplate feature");
            });

            it("will not encode all characters with HTML character entity equivalents", () => {
                const chineseTitle = "膣膗 鍆錌雔";

                ReactDOM.render(
                    <div>
                        <Helmet title={chineseTitle} />
                    </div>,
                    container
                );

                expect(document.title).to.equal(chineseTitle);
            });
        });

        describe("onChangeClientState", () => {
            it("when handling client state change, calls the function with new state, addedTags and removedTags ", () => {
                const spy = sinon.spy();
                ReactDOM.render(
                    <div>
                        <Helmet
                            title={"Main Title"}
                            base={{"href": "http://mysite.com/"}}
                            meta={[{"charset": "utf-8"}]}
                            link={[{"href": "http://localhost/helmet", "rel": "canonical"}]}
                            script={[{"src": "http://localhost/test.js", "type": "text/javascript"}]}
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
                    <Helmet
                        base={{"href": "http://mysite.com/"}}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return Object.is(tag.getAttribute("href"), "http://mysite.com/");
                });

                expect(filteredTags.length).to.equal(1);
            });

            it("will clear the base tag if one is not specified", () => {
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
                    <Helmet
                        base={{"property": "won't work"}}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set base tag based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            base={{"href": "http://mysite.com/"}}
                        />
                        <Helmet
                            base={{"href": "http://mysite.com/public"}}
                        />
                    </div>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);
                const [firstTag] = existingTags;

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(1);

                expect(existingTags)
                    .to.have.deep.property("[0]")
                    .that.is.an.instanceof(Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("href")).to.equal("http://mysite.com/public");
                expect(firstTag.outerHTML).to.equal(`<base href="http://mysite.com/public" ${HELMET_ATTRIBUTE}="true">`);
            });
        });

        describe("meta tags", () => {
            it("can update meta tags", () => {
                ReactDOM.render(
                    <Helmet
                        meta={[
                            {"charset": "utf-8"},
                            {"name": "description", "content": "Test description"},
                            {"http-equiv": "content-type", "content": "text/html"},
                            {"property": "og:type", "content": "article"}
                        ]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return Object.is(tag.getAttribute("charset"), "utf-8") ||
                        (Object.is(tag.getAttribute("name"), "description") && Object.is(tag.getAttribute("content"), "Test description")) ||
                        (Object.is(tag.getAttribute("http-equiv"), "content-type") && Object.is(tag.getAttribute("content"), "text/html"));
                });

                expect(filteredTags.length).to.be.at.least(3);
            });

            it("will clear all meta tags if none are specified", () => {
                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'name', 'http-equiv', 'property', or 'charset' will not be accepted", () => {
                ReactDOM.render(
                    <Helmet
                        meta={[{"href": "won't work"}]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set meta tags based on deepest nested component", () => {
                ReactDOM.render(
                    <div>
                        <Helmet
                            meta={[
                                {"charset": "utf-8"},
                                {"name": "description", "content": "Test description"}
                            ]}
                        />
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"},
                                {"name": "keywords", "content": "test,meta,tags"}
                            ]}
                        />
                    </div>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const [
                    firstTag,
                    secondTag,
                    thirdTag
                ] = existingTags;

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
                    <Helmet
                        meta={[
                            {"name": "description", "content": "Test description"},
                            {"name": "description", "content": "Duplicate description"}
                        ]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const [firstTag, secondTag] = existingTags;

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
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Test description"},
                                {"name": "description", "content": "Duplicate description"}
                            ]}
                        />
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"}
                            ]}
                        />
                    </div>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const [firstTag] = existingTags;

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
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Test description"}
                            ]}
                        />
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"},
                                {"name": "description", "content": "Inner duplicate description"}
                            ]}
                        />
                    </div>,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);
                const [firstTag, secondTag] = existingTags;

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

                const existingTags = headElement.getElementsByTagName("link");

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return (Object.is(tag.getAttribute("href"), "http://localhost/style.css") && Object.is(tag.getAttribute("rel"), "stylesheet") && Object.is(tag.getAttribute("type"), "text/css")) ||
                        (Object.is(tag.getAttribute("href"), "http://localhost/helmet") && Object.is(tag.getAttribute("rel"), "canonical"));
                });

                expect(filteredTags.length).to.be.at.least(2);
            });

            it("will clear all link tags if none are specified", () => {
                ReactDOM.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

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

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
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

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                const [
                    firstTag,
                    secondTag,
                    thirdTag
                ] = existingTags;

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

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                const [
                    firstTag,
                    secondTag
                ] = existingTags;

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

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                const [firstTag] = existingTags;

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

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

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
        });

        describe("script tags", () => {
            it("can update script tags", () => {
                ReactDOM.render(
                    <Helmet
                        script={[
                            {"src": "http://localhost/test.js", "type": "text/javascript"},
                            {"src": "http://localhost/test2.js", "type": "text/javascript"}
                        ]}
                    />,
                    container
                );

                const existingTags = headElement.getElementsByTagName("script");

                expect(existingTags).to.not.equal(undefined);

                const filteredTags = [].slice.call(existingTags).filter((tag) => {
                    return (Object.is(tag.getAttribute("src"), "http://localhost/test.js") && Object.is(tag.getAttribute("type"), "text/javascript")) ||
                        (Object.is(tag.getAttribute("src"), "http://localhost/test2.js") && Object.is(tag.getAttribute("type"), "text/javascript"));
                });

                expect(filteredTags.length).to.be.at.least(2);
            });

            it("will clear all scripts tags if none are specified", () => {
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

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                const [
                    firstTag,
                    secondTag
                ] = existingTags;

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
        });
    });

    describe("server", () => {
        const stringifiedTitle = `<title ${HELMET_ATTRIBUTE}="true">Dangerous &lt;script&gt; include</title>`;
        const stringifiedBaseTag = `<base ${HELMET_ATTRIBUTE}="true" target="_blank" href="http://localhost/"/>`;

        const stringifiedMetaTags = [
            `<meta ${HELMET_ATTRIBUTE}="true" charset="utf-8"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description &amp; encoding of special characters like &#x27; &quot; &gt; &lt; \`"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html"/>`,
            `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article"/>`
        ].join("");

        const stringifiedLinkTags = [
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/helmet" rel="canonical"/>`,
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/style.css" rel="stylesheet" type="text/css"/>`
        ].join("");

        const stringifiedScriptTags = [
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript"></script>`,
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test2.js" type="text/javascript"></script>`
        ].join("");

        before(() => {
            Helmet.canUseDOM = false;
        });

        it("will html encode title", () => {
            ReactDOM.render(
                <Helmet
                    title="Dangerous <script> include"
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            expect(head.title.toString()).to.equal(stringifiedTitle);
        });

        it("will render title as React component", () => {
            ReactDOM.render(
                <Helmet
                    title={"Dangerous <script> include"}
                />,
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

        it("will render base tag as React component", () => {
            ReactDOM.render(
                <Helmet
                    base={{"target": "_blank", "href": "http://localhost/"}}
                />,
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
                <Helmet
                    meta={[
                        {"charset": "utf-8"},
                        {"name": "description", "content": "Test description & encoding of special characters like ' \" > < `"},
                        {"http-equiv": "content-type", "content": "text/html"},
                        {"property": "og:type", "content": "article"}
                    ]}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.meta).to.exist;
            expect(head.meta).to.respondTo("toComponent");

            const metaComponent = head.meta.toComponent();

            expect(metaComponent)
                .to.be.an("array")
                .that.has.length.of(4);

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
                <Helmet
                    link={[
                        {"href": "http://localhost/helmet", "rel": "canonical"},
                        {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}
                    ]}
                />,
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
                <Helmet
                    script={[
                        {"src": "http://localhost/test.js", "type": "text/javascript"},
                        {"src": "http://localhost/test2.js", "type": "text/javascript"}
                    ]}
                />,
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

        it("will render title tag as string", () => {
            ReactDOM.render(
                <Helmet
                    title={"Dangerous <script> include"}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.exist;
            expect(head.title).to.respondTo("toString");

            expect(head.title.toString())
                .to.be.a("string")
                .that.equals(stringifiedTitle);
        });

        it("will render base tags as string", () => {
            ReactDOM.render(
                <Helmet
                    base={{"target": "_blank", "href": "http://localhost/"}}
                />,
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
                <Helmet
                    meta={[
                        {"charset": "utf-8"},
                        {"name": "description", "content": "Test description & encoding of special characters like ' \" > < `"},
                        {"http-equiv": "content-type", "content": "text/html"},
                        {"property": "og:type", "content": "article"}
                    ]}
                />,
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
                <Helmet
                    link={[
                        {"href": "http://localhost/helmet", "rel": "canonical"},
                        {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}
                    ]}
                />,
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
                <Helmet
                    script={[
                        {"src": "http://localhost/test.js", "type": "text/javascript"},
                        {"src": "http://localhost/test2.js", "type": "text/javascript"}
                    ]}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.script).to.exist;
            expect(head.script).to.respondTo("toString");

            expect(head.script.toString())
                .to.be.a("string")
                .that.equals(stringifiedScriptTags);
        });

        it("will not encode all characters with HTML character entity equivalents", () => {
            const chineseTitle = "膣膗 鍆錌雔";
            const stringifiedChineseTitle = `<title ${HELMET_ATTRIBUTE}="true">${chineseTitle}</title>`;

            ReactDOM.render(
                <div>
                    <Helmet title={chineseTitle} />
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

        after(() => {
            Helmet.canUseDOM = true;
        });
    });

    describe("misc", () => {
        it("throws in rewind() when a DOM is present", () => {
            ReactDOM.render(
                <Helmet
                    title={"Fancy title"}
                />,
                container
            );

            expect(Helmet.rewind).to.throw(
                "You may ony call rewind() on the server. Call peek() to read the current state."
            );
        });

        it("lets you read current state in peek() whether or not a DOM is present", () => {
            ReactDOM.render(
                <Helmet
                    title={"Fancy title"}
                />,
                container
            );

            expect(Helmet.peek().title).to.be.equal("Fancy title");
            Helmet.canUseDOM = false;
            expect(Helmet.peek().title).to.be.equal("Fancy title");
            Helmet.canUseDOM = true;
        });

        it("will html encode string", () => {
            ReactDOM.render(
                <Helmet
                    meta={[
                        {"name": "description", "content": "This is \"quoted\" text and & and '."}
                    ]}
                />,
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
                <Helmet
                    title={"Test Title"}
                    meta={[{"name": "description", "content": "Test description"}]}
                    onChangeClientState={spy}
                />,
                container
            );

            // Re-rendering will pass new props to an already mounted Helmet
            ReactDOM.render(
                <Helmet
                    title={"Test Title"}
                    meta={[{"name": "description", "content": "Test description"}]}
                    onChangeClientState={spy}
                />,
                container
            );

            expect(spy.callCount).to.equal(1);
        });

        it("will only add new tags and will perserve tags when rendering additional Helmet instances", () => {
            const spy = sinon.spy();
            let addedTags;
            let removedTags;
            ReactDOM.render(
                <Helmet
                    meta={[{"name": "description", "content": "Test description"}]}
                    link={[{"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}]}
                    onChangeClientState={spy}
                />,
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
                <Helmet
                    meta={[{"name": "description", "content": "New description"}]}
                    link={[
                        {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"},
                        {"href": "http://localhost/style2.css", "rel": "stylesheet", "type": "text/css"}
                    ]}
                    onChangeClientState={spy}
                />,
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
                <Helmet
                    title={"Test Title"}
                >
                    <Helmet
                        title={"Title you'll never see"}
                    />
                </Helmet>,
                container
            );

            expect(document.title).to.equal("Test Title");
        });
    });
});
