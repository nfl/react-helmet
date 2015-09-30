/* eslint max-nested-callbacks: [1, 5] */

import React from "react/addons";
import Helmet from "../index";
import {HelmetComponent} from "../Helmet";

const HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", () => {
    var headElement;

    const container = document.createElement("div");

    beforeEach(() => {
        headElement = headElement || document.head || document.querySelector("head");
    });

    afterEach(() => {
        React.unmountComponentAtNode(container);
    });

    describe("api", () => {
        describe("title", () => {
            it("can update page title", () => {
                React.render(
                    <Helmet title={"Test Title"} />,
                    container
                );

                expect(document.title).to.equal("Test Title");
            });

            it("can update page title with multiple children", () => {
                React.render(
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
                React.render(
                    <div>
                        <Helmet title={"Main Title"} />
                        <Helmet title={"Nested Title"} />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Nested Title");
            });

            it("will set title using deepest nested component with a defined title", () => {
                React.render(
                    <div>
                        <Helmet title={"Main Title"} />
                        <Helmet />
                    </div>,
                    container
                );

                expect(document.title).to.equal("Main Title");
            });

            it("will use a titleTemplate if defined", () => {
                React.render(
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    />,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature");
            });

            it("will replace multiple title strings in titleTemplate", () => {
                React.render(
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature. Another %s."}
                    />,
                    container
                );

                expect(document.title).to.equal("This is a Test of the titleTemplate feature. Another Test.");
            });

            it("will use a titleTemplate based on deepest nested component", () => {
                React.render(
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
                React.render(
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
        });

        describe("base tag", () => {
            it("can update base tag", () => {
                React.render(
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
                React.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'href' will not be accepted", () => {
                React.render(
                    <Helmet
                        base={["property", "won't work"]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`base[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set base tag based on deepest nested component", () => {
                React.render(
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
                React.render(
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
                React.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'name', 'http-equiv', 'property', or 'charset' will not be accepted", () => {
                React.render(
                    <Helmet
                        meta={["href", "won't work"]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set meta tags based on deepest nested component", () => {
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'href' or 'rel' will not be accepted, even if they are valid for other tags", () => {
                React.render(
                    <Helmet
                        link={["http-equiv", "won't work"]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set link tags based on deepest nested component", () => {
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
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
                React.render(
                    <Helmet />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'src' will not be accepted", () => {
                React.render(
                    <Helmet
                        script={["property", "won't work"]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`script[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set script tags based on deepest nested component", () => {
                React.render(
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
        const stringifiedBaseTag = `<base ${HELMET_ATTRIBUTE}="true" target="_blank" href="http://localhost/">`;

        const stringifiedMetaTags = [
            `<meta ${HELMET_ATTRIBUTE}="true" property="og:type" content="article">`,
            `<meta ${HELMET_ATTRIBUTE}="true" http-equiv="content-type" content="text/html">`,
            `<meta ${HELMET_ATTRIBUTE}="true" name="description" content="Test description">`,
            `<meta ${HELMET_ATTRIBUTE}="true" charset="utf-8">`
        ].join("");

        const stringifiedLinkTags = [
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/style.css" rel="stylesheet" type="text/css">`,
            `<link ${HELMET_ATTRIBUTE}="true" href="http://localhost/helmet" rel="canonical">`
        ].join("");

        const stringifiedScriptTags = [
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test2.js" type="text/javascript"></script>`,
            `<script ${HELMET_ATTRIBUTE}="true" src="http://localhost/test.js" type="text/javascript"></script>`
        ].join("");

        before(() => {
            Helmet.canUseDOM = false;
        });

        it("will html encode title", () => {
            React.render(
                <Helmet
                    title="Dangerous <script> include"
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.equal("Dangerous &#x3C;script&#x3E; include");
        });

        it("will render base tag as React component", () => {
            React.render(
                <Helmet
                    base={{"target": "_blank", "href": "http://localhost/"}}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.base).to.exist;
            expect(head.base)
                .to.be.an("array")
                .that.has.length.of(1);

            head.base.forEach(base => {
                expect(base)
                    .to.be.an("object")
                    .that.contains.property("type", "base");
            });

            const markup = React.renderToStaticMarkup(
                <div>
                    {head.base}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedBaseTag
                }</div>`);
        });

        it("will render meta tags as React components", () => {
            React.render(
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

            const head = Helmet.rewind();

            expect(head.meta).to.exist;

            expect(head.meta)
                .to.be.an("array")
                .that.has.length.of(4);

            head.meta.forEach(meta => {
                expect(meta)
                    .to.be.an("object")
                    .that.contains.property("type", "meta");
            });

            const markup = React.renderToStaticMarkup(
                <div>
                    {head.meta}
                </div>
            );
            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedMetaTags
                }</div>`);
        });

        it("will render link tags as React components", () => {
            React.render(
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
            expect(head.link)
                .to.be.an("array")
                .that.has.length.of(2);

            head.link.forEach(link => {
                expect(link)
                    .to.be.an("object")
                    .that.contains.property("type", "link");
            });

            const markup = React.renderToStaticMarkup(
                <div>
                    {head.link}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedLinkTags
                }</div>`);
        });

        it("will render script tags as React components", () => {
            React.render(
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
            expect(head.script)
                .to.be.an("array")
                .that.has.length.of(2);

            head.script.forEach(script => {
                expect(script)
                    .to.be.an("object")
                    .that.contains.property("type", "script");
            });

            const markup = React.renderToStaticMarkup(
                <div>
                    {head.script}
                </div>
            );

            expect(markup)
                .to.be.a("string")
                .that.equals(`<div>${
                    stringifiedScriptTags
                }</div>`);
        });

        it("supports head.base.toString()", () => {
            React.render(
                <Helmet
                    base={{"target": "_blank", "href": "http://localhost/"}}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.base).to.respondTo("toString");

            const baseToString = head.base.toString();

            expect(baseToString)
                .to.be.a("string")
                .that.equals(stringifiedBaseTag);
        });

        it("supports head.meta.toString()", () => {
            React.render(
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

            const head = Helmet.rewind();

            expect(head.meta).to.respondTo("toString");

            const metaToString = head.meta.toString();

            expect(metaToString)
                .to.be.a("string")
                .that.equals(stringifiedMetaTags);
        });

        it("supports head.link.toString()", () => {
            React.render(
                <Helmet
                    link={[
                        {"href": "http://localhost/helmet", "rel": "canonical"},
                        {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}
                    ]}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.link).to.respondTo("toString");

            const linkToString = head.link.toString();

            expect(linkToString)
                .to.be.a("string")
                .that.equals(stringifiedLinkTags);
        });

        it("supports head.script.toString()", () => {
            React.render(
                <Helmet
                    script={[
                        {"src": "http://localhost/test.js", "type": "text/javascript"},
                        {"src": "http://localhost/test2.js", "type": "text/javascript"}
                    ]}
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.script).to.respondTo("toString");

            const scriptToString = head.script.toString();

            expect(scriptToString)
                .to.be.a("string")
                .that.equals(stringifiedScriptTags);
        });

        after(() => {
            Helmet.canUseDOM = true;
        });
    });

    describe("misc", () => {
        it("throws in rewind() when a DOM is present", () => {
            React.render(
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
            React.render(
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
            React.render(
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

        it("will not update the DOM if updated props are unchanged", (done) => {
            const old = HelmetComponent.onDOMChange;
            let changesToDOM = 0;
            HelmetComponent.onDOMChange = (state) => {
                changesToDOM++;
                return old(state);
            };

            React.render(
                <Helmet
                    title={"Test Title"}
                    meta={[{"name": "description", "content": "Test description"}]}
                />,
                container
            );

            // Re-rendering will pass new props to an already mounted Helmet
            React.render(
                <Helmet
                    title={"Test Title"}
                    meta={[{"name": "description", "content": "Test description"}]}
                />,
                container
            );

            setTimeout(() => {
                expect(changesToDOM).to.equal(1);
                HelmetComponent.onDOMChange = old;
                done();
            }, 1000);
        });

        it("will not update the DOM when nested Helmets have props that are identical", (done) => {
            const old = HelmetComponent.onDOMChange;
            let changesToDOM = 0;
            HelmetComponent.onDOMChange = (state) => {
                changesToDOM++;
                return old(state);
            };

            React.render(
                <Helmet
                    title={"Test Title"}
                    meta={[{"name": "description", "content": "Test description"}]}
                >
                    <div>
                        <Helmet
                            title={"Test Title"}
                            meta={[{"name": "description", "content": "Test description"}]}
                        />
                    </div>
                </Helmet>,
                container
            );

            setTimeout(() => {
                expect(changesToDOM).to.equal(1);
                HelmetComponent.onDOMChange = old;
                done();
            }, 1000);
        });
    });
});
