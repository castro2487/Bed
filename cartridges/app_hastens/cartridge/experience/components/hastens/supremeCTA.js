'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('SupremeCTA', function(context) {
    return {
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
    };
});
