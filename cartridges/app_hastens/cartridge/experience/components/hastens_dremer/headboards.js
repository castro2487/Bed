'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var URLUtils = require('dw/web/URLUtils');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DremerCampaignHeadboards', function (context) {
    return {
        blockId: 'headboard',
        body: context.content.body,
        details: context.content.details,
        ctaBody: context.content.ctaBody,
        newsletterCta: context.content.linkText,
        newsletterFormHeading: context.content.newsletterFormHeading,
        fallbackRequestCatalogUrl: URLUtils.home().toString(),
    };
});
