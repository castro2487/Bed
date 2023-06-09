'use strict';

var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper');

module.exports.render = RenderHelper.renderStandardComponentWithContext('AccessoryImage', function (context) {
    return {
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
                mobile: context.content.mobileImage || null,
                tablet: context.content.tabletImage || null,
            }),
            alt: context.content.text,
        },
        text: context.content.text,
        linkUrl: context.content.linkUrl,
        textAlignment: context.content.textAlignment ? context.content.textAlignment.value : 'bottom',
        theme: context.content.theme ? context.content.theme.value : null,
        colspan: context.content.colspan ? context.content.colspan.value : 'colspan-1',
        containerClass: context.content.colspan ? context.content.colspan.value : 'colspan-1',
    };
});
