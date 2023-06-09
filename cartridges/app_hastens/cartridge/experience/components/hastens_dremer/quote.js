'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignQuote', function (context) {
    return {
        quote: context.content.quote,
        quoteBy: context.content.quoteBy,
    };
});
