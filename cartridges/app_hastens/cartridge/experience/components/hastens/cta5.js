'use strict';

var Resource = require('dw/web/Resource');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DesignerCTA', function (context) {

    return {
        text: {
            by: Resource.msg('by', 'hastens', null),
            collection: context.content.collection || null,
            designer: context.content.designer || null,
            body: context.content.body || null,
        },
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
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
        variation: context.content.variation ? context.content.variation.value : 'variation-1',
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
