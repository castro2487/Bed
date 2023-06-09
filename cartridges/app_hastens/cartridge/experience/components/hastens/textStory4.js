'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('HeritageTextStory', function(context) {
    return {
        heading: context.content.heading,
        body: context.content.body ? context.content.body.value : null,
        body2: context.content.body2 ? context.content.body2.value : null,
        theme: context.content.theme ? context.content.theme.value : null,
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
            }),
        },
        imageCaption: context.content.imageCaption,
        imagePosition: context.content.imagePosition ? context.content.imagePosition.value : 'left'
    };
});
