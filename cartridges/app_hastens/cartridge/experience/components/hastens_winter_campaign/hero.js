'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('WinterCampaignHero', function (context) {
    return {
        heading: context.content.heading,
        heading2: context.content.heading2,
        footerHeading: context.content.footerHeading,
        footerBody: context.content.footerBody,
        footerLink: {
            text: context.content.footerLinkText,
            url: context.content.footerLinkUrl,
        },
    };
});
