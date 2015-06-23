import React from "react/addons";
import Helmet from "../index.jsx";

const HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", () => {
    var headElement;

    const {TestUtils} = React.addons;
    let HelmetRendered;

    beforeEach(() => {
        headElement = headElement || document.head || document.querySelector("head");

        if (HelmetRendered) {
            HelmetRendered.constructor.dispose();
        }
    });

    it("can update page title", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Test Title"}
                />
            );

        expect(document.title).to.equal("Test Title");
    });

    it("can update page title with multiple children", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Test Title"}
                >
                    <Helmet
                        title={"Child One Title"}
                    />
                    <Helmet
                        title={"Child Two Title"}
                    />
                </Helmet>
            );

        expect(document.title).to.equal("Child Two Title");
    });

    it("will set blank title if none is specified", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet />
            );

        expect(document.title).to.equal("");
    });

    it("will set title based on deepest nested component", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet title={"Main Title"}>
                    <Helmet title={"Nested Title"} />
                </Helmet>
            );

        expect(document.title).to.equal("Nested Title");
    });

    it("will use a titleTemplate if defined", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Test"}
                    titleTemplate={"This is a %s of the titleTemplate feature"}
                />
            );

        expect(document.title).to.equal("This is a Test of the titleTemplate feature");
    });

    it("will use a titleTemplate based on deepest nested component", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Test"}
                    titleTemplate={"This is a %s of the titleTemplate feature"}
                >
                    <Helmet
                        title={"Second Test"}
                        titleTemplate={"A %s using nested titleTemplate attributes"}
                    />
                </Helmet>
            );

        expect(document.title).to.equal("A Second Test using nested titleTemplate attributes");
    });

    it("will merge deepest component title with nearest upstream titleTemplate", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Test"}
                    titleTemplate={"This is a %s of the titleTemplate feature"}
                >
                    <Helmet title={"Second Test"} />
                </Helmet>
            );

        expect(document.title).to.equal("This is a Second Test of the titleTemplate feature");
    });

    it("can update meta tags", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    meta={[
                        {"charset": "utf-8"},
                        {"name": "description", "content": "Test description"},
                        {"http-equiv": "content-type", "content": "text/html"},
                        {"property": "og:type", "content": "article"}
                    ]}
                />
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
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet />
            );

        const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
    });

    it("tags without 'name', 'http-equiv', 'property', or 'charset' will not be accepted", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    meta={["content", "won't work"]}
                />
            );

        const existingTags = headElement.querySelectorAll(`meta[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
    });

    it("will set meta tags based on deepest nested component", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    meta={[
                        {"name": "description", "content": "Test description"},
                        {"name": "description", "content": "Duplicate description"}
                    ]}
                />
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
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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

    it("can update link tags", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    link={[
                        {"href": "http://localhost/helmet", "rel": "canonical"},
                        {"href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css"}
                    ]}
                />
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
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet />
            );

        const existingTags = headElement.querySelectorAll(`link[${HELMET_ATTRIBUTE}]`);

        expect(existingTags).to.not.equal(undefined);
        expect(existingTags.length).to.equal(0);
    });

    it("will set link tags based on deepest nested component", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    link={[
                        {"rel": "canonical", "href": "http://localhost/helmet"},
                        {"rel": "canonical", "href": "http://localhost/helmet/component"}
                    ]}
                />
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
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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
        HelmetRendered = TestUtils.renderIntoDocument(
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
                </Helmet>
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

    it("without prerender will return default head values when a DOM is present", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    title={"Title that won't be recorded"}
                    meta={[
                        {"charset": "utf-8"},
                        {"name": "description", "content": "Test description"},
                        {"http-equiv": "content-type", "content": "text/html"},
                        {"property": "og:type", "content": "article"}
                    ]}
                    link={[
                        {"href": "http://localhost/helmet/innercomponent", "rel": "canonical"},
                        {"href": "http://localhost/inner.css", "rel": "stylesheet", "type": "text/css", "media": "all"}
                    ]}
                />
            );

        const head = HelmetRendered.constructor.rewind();
        expect(head.title).to.be.equal("");
        expect(head.meta).to.be.equal("");
        expect(head.link).to.be.equal("");
    });

    it("will html encode string", () => {
        HelmetRendered = TestUtils.renderIntoDocument(
                <Helmet
                    meta={[
                        {"name": "description", "content": "This is \"quoted\" text and & and '."}
                    ]}
                />
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
});
