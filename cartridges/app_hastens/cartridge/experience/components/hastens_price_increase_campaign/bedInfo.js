'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('PriceIncreaseCampaignBedInfo', function (context) {
    return {
        heading: context.content.heading,
        description: context.content.description,
        description2: context.content.description2,
        priceBefore: context.content.priceBefore,
        priceBeforeDescription: context.content.priceBeforeDescription,
        priceAfter: context.content.priceAfter,
        priceAfterDescription: context.content.priceAfterDescription,
        moneySaved: context.content.moneySaved,
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
        imageCode: context.content.image ? context.content.image.value : null,
        imagePosition: context.content.imagePosition ? context.content.imagePosition : 'right',
    };
});
