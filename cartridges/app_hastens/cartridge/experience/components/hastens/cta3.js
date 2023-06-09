'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('LargeCTAWithSmallText', function(context) {
    return {
        text: {
            heading: context.content.heading,
        },
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        image: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.tabletImage,
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
