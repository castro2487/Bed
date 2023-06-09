'use strict';

var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper');

module.exports.render = RenderHelper.renderStandardComponentWithContext('Image', function(context) {
    return {
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
                mobile: context.content.mobileImage || null,
                tablet: context.content.tabletImage || null,
            }),
            alt: context.content.footer,
        },
        footer: context.content.footer,
        desktopRatio: context.content.ratio ? context.content.ratio.value : null,
        mobileRatio: context.content.mobileRatio ? context.content.mobileRatio.value : null,
        theme: context.content.theme ? context.content.theme.value : null,
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
