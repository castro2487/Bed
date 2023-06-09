'use strict';

var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper');

module.exports.render = RenderHelper.renderStandardComponentWithContext('ColorsImage', function(context) {
    return {
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
                mobile: context.content.mobileImage || null,
                tablet: context.content.tabletImage || null,
            }),
            alt: context.content.color,
        },
        color: context.content.color,
        theme: context.content.theme ? context.content.theme.value : null,
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
