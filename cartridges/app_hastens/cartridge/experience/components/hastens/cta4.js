'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('ZoomCTA', function(context) {
    return {
        text: {
            heading: context.content.heading,
        },
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
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
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
