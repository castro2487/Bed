'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('ShopHeader', function(context) {
    return {
        heading: context.content.heading,
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
                tablet: context.content.image,
            }, true),
        },
        theme: context.content.theme ? context.content.theme.value : 'primary-1',
        customTheme: {
            backgroundColor: context.content.backgroundColor,
            color: context.content.textColor,
        },
    };
});
