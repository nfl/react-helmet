import React from "react";
import ExecutionEnvironment from "react/lib/ExecutionEnvironment";
import CreateSideEffect from "./CreateSideEffect";
import {TAG_NAMES, TAG_PROPERTIES} from "./HelmetConstants.js";
import HTMLEntities from "he";

const HELMET_ATTRIBUTE = "data-react-helmet";

const getTitleFromPropsList = (propsList) => {
    const innermostProps = propsList[propsList.length - 1];
    return innermostProps ? innermostProps.title : "";
};

const getTagsFromPropsList = (tagName, uniqueTagIds, propsList) => {
    // Calculate list of tags, giving priority innermost component (end of the propslist)
    const approvedSeenTags = {};
    const validTags = Object.keys(TAG_PROPERTIES).map(key => TAG_PROPERTIES[key]);

    const tagList = propsList
        .filter(props => !Object.is(typeof props[tagName], "undefined"))
        .map(prop => prop[tagName])
        .reverse()
        .reduce((approvedTags, instanceTags) => {
            const instanceSeenTags = {};

            instanceTags.filter(tag => {
                for (const attributeKey of Object.keys(tag)) {
                    const lowerCaseAttributeKey = attributeKey.toLowerCase();
                    const value = tag[attributeKey].toLowerCase();

                    if (Object.is(validTags.indexOf(lowerCaseAttributeKey), -1)) {
                        return false;
                    }

                    approvedSeenTags[lowerCaseAttributeKey] = approvedSeenTags[lowerCaseAttributeKey] || [];
                    instanceSeenTags[lowerCaseAttributeKey] = instanceSeenTags[lowerCaseAttributeKey] || [];

                    if (approvedSeenTags[lowerCaseAttributeKey].indexOf(value) < 0) {
                        instanceSeenTags[lowerCaseAttributeKey].push(value);
                        return true;
                    }

                    return false;
                }
            })
            .reverse()
            .forEach(tag => approvedTags.push(tag));

            // Update seen tags with tags from this instance
            for (const attributeKey of Object.keys(instanceSeenTags)) {
                approvedSeenTags[attributeKey] = approvedSeenTags[attributeKey].concat(instanceSeenTags[attributeKey]);
            }

            return approvedTags;
        }, []);

    return tagList;
};

const updateTags = (type, tags) => {
    const headElement = document.head || document.querySelector("head");
    const existingTags = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);

    // Remove any tags previously injected by Helmet
    Array.forEach(existingTags, tag => tag.parentNode.removeChild(tag));

    if (tags && tags.length) {
        tags.forEach(tag => {
            const newElement = document.createElement(type);

            for (const attribute in tag) {
                if (tag.hasOwnProperty(attribute)) {
                    newElement.setAttribute(attribute, tag[attribute]);
                }
            }

            newElement.setAttribute(HELMET_ATTRIBUTE, "true");
            headElement.insertBefore(newElement, headElement.firstChild);
        });
    }
};

const generateTagsAsString = (type, tags) => {
    const html = tags.map(tag => {
        const attributeHtml = Object.keys(tag)
            .map((attribute) => {
                const encodedValue = HTMLEntities.encode(tag[attribute], {
                    useNamedReferences: true
                });
                return `${attribute}="${encodedValue}"`;
            })
            .join(" ");

        return `<${type} ${attributeHtml} ${HELMET_ATTRIBUTE}="true" />`;
    });

    return html.join("\n");
};

let serverTitle = "";
let serverMetaTags = [];
let serverLinkTags = [];

class Helmet extends React.Component {
    static displayName = "Helmet"
    /**
     * @param {Object} title: "Title"
     * @param {Object} meta: [{"name": "description", "content": "Test description"}]
     * @param {Object} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
     */
    static propTypes = {
        title: React.PropTypes.string,
        meta: React.PropTypes.arrayOf(React.PropTypes.object),
        link: React.PropTypes.arrayOf(React.PropTypes.object),
        children: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array
        ])
    }

    static handleChange(propsList) {
        const title = getTitleFromPropsList(propsList);
        const metaTags = getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV], propsList);
        const linkTags = getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList);

        if (ExecutionEnvironment.canUseDOM) {
            document.title = title || "";
            updateTags(TAG_NAMES.LINK, linkTags);
            updateTags(TAG_NAMES.META, metaTags);
        } else {
            serverTitle = title || "";
            serverMetaTags = metaTags;
            serverLinkTags = linkTags;
        }
    }

    static peek() {
        return serverTitle;
    }

    static rewind() {
        const title = serverTitle;
        const meta = generateTagsAsString(TAG_NAMES.META, serverMetaTags);
        const link = generateTagsAsString(TAG_NAMES.LINK, serverLinkTags);

        this.dispose();

        return {
            title,
            meta,
            link
        };
    }

    render() {
        if (Object.is(React.Children.count(this.props.children), 1)) {
            return React.Children.only(this.props.children);
        } else if (React.Children.count(this.props.children) > 1) {
            return (
                <span>
                    {this.props.children}
                </span>
            );
        }

        return null;
    }
}

export default CreateSideEffect(Helmet);

