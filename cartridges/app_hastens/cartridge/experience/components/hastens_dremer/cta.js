'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignCTA', function(context) {
    return {
        heading: context.content.heading,
        body: context.content.body,
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
    };
});
