'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignHero', function (context) {
    return {
        body: context.content.body,
        heading2: context.content.heading2,
        body2: context.content.body2,
    };
});
