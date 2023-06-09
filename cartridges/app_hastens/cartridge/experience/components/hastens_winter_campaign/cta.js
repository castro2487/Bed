'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('WinterCampaignCTA', function (context) {
    return {
        heading: context.content.heading,
        body: context.content.body,
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
        image: context.content.image ? context.content.image.value : null,
    };
});
