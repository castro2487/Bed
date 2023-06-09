'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('LargeTextStory', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body.value,
        },
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
            }),
            alt: context.content.heading,
        },
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        columns: context.content.columns ? parseInt(context.content.columns.value) : 1,
        textAlignment: context.content.textAlignment ? context.content.textAlignment.value : 'left',
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        buttonAppearance: context.content.buttonAppearance ? context.content.buttonAppearance.value : 'standard',
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
