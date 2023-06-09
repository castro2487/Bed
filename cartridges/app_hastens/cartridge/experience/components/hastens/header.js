'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('AnimatedHeader', function(context) {
    return {
        heading: context.content.heading,
        video: context.content.video,
        theme: context.content.theme ? context.content.theme.value : null,
    };
});
