'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignFabrics', function (context) {
    return {
        blockId: 'color-choice',
        heading: context.content.heading,
        details: context.content.details,
        ctaBody: context.content.ctaBody,
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
    };
});
