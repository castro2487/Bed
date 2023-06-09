'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignHero2', function (context) {
    return {
        heading: context.content.heading,
        body: context.content.body,
    };
});
