'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('PTextHistory', function(context) {
    return {
        heading: context.content.heading,
        body: context.content.body ? context.content.body.value : null
    };
});
