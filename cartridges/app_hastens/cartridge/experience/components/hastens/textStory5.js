'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('ThreeSplitTextStory', function (context) {
    return {
        body: context.content.body ? context.content.body.value : '',
        image1: {
            sizes: ImageHelper.getSizes({ desktop: context.content.image }),
        },
        image2: {
            sizes: ImageHelper.getSizes({ desktop: context.content.image2 }),
        },
        image3: {
            sizes: ImageHelper.getSizes({ desktop: context.content.image3 }),
        },
        logo: {
            sizes: ImageHelper.getSizes({ desktop: context.content.image4 }),
            alt: '',
        },
        theme: context.content.theme ? context.content.theme.value : null,
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
