'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('PartnerSlide', function(context) {
    return {
        text: {
            name: context.content.name,
            quote: context.content.quote,
            location: context.content.location,
        },
        image: {
            sizes: ImageHelper.getSizes({desktop: context.content.image}),
        },
    };
});
