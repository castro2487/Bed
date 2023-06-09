'use strict';

var Resource = require('dw/web/Resource');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DesignerHero', function(context) {
    return {
        text: {
            by: Resource.msg('by', 'hastens', null),
            collection: context.content.collection || null,
            designer: context.content.designer || null,
        },
        useTextShadow: context.content.textShadow,
        variation: context.content.variation ? context.content.variation.value : null,
        theme: context.content.theme ? context.content.theme.value : null,
        image: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.tabletImage,
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
    };
});
