'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('NewsTile2', function(context) {
    return {
        heading: context.content.heading,
        excerpt: context.content.excerpt,
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        image: {
            sizes: ImageHelper.getSizes({ desktop: context.content.image }),
        },
        imageHeading: context.content.imageHeading,
        imageBody: context.content.imageBody,
        theme: context.content.theme ? context.content.theme.value : 'primary-1',
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
    };
});
