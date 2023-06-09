'use strict';

var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper');

module.exports.render = RenderHelper.renderStandardComponentWithContext('ImageTextStory2', function(context) {
    return {
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
            }),
            alt: context.content.heading,
        },
        text: {
            heading: context.content.heading,
            body: context.content.body.value,
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
        imagePlacement: context.content.imagePlacement ? context.content.imagePlacement.value : 'left',
    };
});
