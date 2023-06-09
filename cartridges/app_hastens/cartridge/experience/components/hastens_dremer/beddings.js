'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignBeddings', function (context) {
    return {
        blockId: 'beddings',
        heading: context.content.heading,
        body: context.content.body,
        slides: [
            { text: context.content.slideText1 },
            { text: context.content.slideText2 },
            { text: context.content.slideText3 },
            { text: context.content.slideText4 },
            { text: context.content.slideText5 },
            { text: context.content.slideText6 },
            { text: context.content.slideText7 },
            { text: context.content.slideText8 },
        ],
    };
});
