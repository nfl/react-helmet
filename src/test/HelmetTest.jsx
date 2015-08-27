/* eslint max-nested-callbacks: [1, 5] */

import React from "react/addons";
import Helmet from "../index";

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
                    <Helmet
                        title={"Test Title"}
                    />,
                    container
                );

                expect(document.title).to.equal("Test Title");
            });

            it("can update page title with multiple children", () => {
                React.render(
                    <Helmet
                        title={"Test Title"}
                    >
                        <Helmet
                            title={"Child One Title"}
                        />
                        <Helmet
                            title={"Child Two Title"}
                        />
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("Child Two Title");
            });

            it("will set title based on deepest nested component", () => {
                React.render(
                    <Helmet title={"Main Title"}>
                        <Helmet title={"Nested Title"} />
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("Nested Title");
            });

            it("will set title using deepest nested component with a defined title", () => {
                React.render(
                    <Helmet title={"Main Title"}>
                        <Helmet />
                    </Helmet>,
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
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    >
                        <Helmet
                            title={"Second Test"}
                            titleTemplate={"A %s using nested titleTemplate attributes"}
                        />
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("A Second Test using nested titleTemplate attributes");
            });

            it("will merge deepest component title with nearest upstream titleTemplate", () => {
                React.render(
                    <Helmet
                        title={"Test"}
                        titleTemplate={"This is a %s of the titleTemplate feature"}
                    >
                        <Helmet title={"Second Test"} />
                    </Helmet>,
                    container
                );

                expect(document.title).to.equal("This is a Second Test of the titleTemplate feature");
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
                        meta={["content", "won't work"]}
                    />,
                    container
                );

                const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set meta tags based on deepest nested component", () => {
                React.render(
                    <Helmet
                        meta={[
                            {"charset": "utf-8"},
                            {"name": "description", "content": "Test description"}
                        ]}
                    >
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"},
                                {"name": "keywords", "content": "test,meta,tags"}
                            ]}
                        />
                    </Helmet>,
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
                    <Helmet
                        meta={[
                            {"name": "description", "content": "Test description"},
                            {"name": "description", "content": "Duplicate description"}
                        ]}
                    >
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"}
                            ]}
                        />
                    </Helmet>,
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
                    <Helmet
                        meta={[
                            {"name": "description", "content": "Test description"}
                        ]}
                    >
                        <Helmet
                            meta={[
                                {"name": "description", "content": "Inner description"},
                                {"name": "description", "content": "Inner duplicate description"}
                            ]}
                        />
                    </Helmet>,
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

            it("will set link tags based on deepest nested component", () => {
                React.render(
                    <Helmet
                        link={[
                            {"rel": "canonical", "href": "http://localhost/helmet"},
                            {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                        ]}
                    >
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"},
                                {"href": "http://localhost/inner.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                            ]}
                        />
                    </Helmet>,
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
                    <Helmet
                        link={[
                            {"rel": "canonical", "href": "http://localhost/helmet"},
                            {"rel": "canonical", "href": "http://localhost/helmet/component"}
                        ]}
                    >
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"}
                            ]}
                        />
                    </Helmet>,
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
                    <Helmet
                        link={[
                            {"rel": "canonical", "href": "http://localhost/helmet"}
                        ]}
                    >
                        <Helmet
                            link={[
                                {"rel": "canonical", "href": "http://localhost/helmet/component"},
                                {"rel": "canonical", "href": "http://localhost/helmet/innercomponent"}
                            ]}
                        />
                    </Helmet>,
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

        it("will html encode title on server", () => {
            Helmet.canUseDOM = false;

            React.render(
                <Helmet
                    title="Dangerous <script> include"
                />,
                container
            );

            const head = Helmet.rewind();

            expect(head.title).to.be.equal("Dangerous &#x3C;script&#x3E; include");

            Helmet.canUseDOM = true;
        });
    });
});
