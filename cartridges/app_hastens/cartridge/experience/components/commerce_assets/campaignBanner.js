'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

/**
 * Render logic for storefront.campaignBanner component.
 * @param {dw.experience.ComponentScriptContext} context The component script context object.
 * @returns {string} The template to be displayed
 */
module.exports.render = function (context) {
    var content = context.content;

    var model = new HashMap();
    model.bannerMessage = content.bannerMessage;

    // These assets were moved here from pdStorePage.isml because we dont want to include assets we dont currently use
    // If we start using campaign banner in the future we should consider moving these assets back to pdStorePage.isml
    // Including these assets at component level is not supported because they should only be included once
    var assets = require('*/cartridge/scripts/assets.js');
    assets.addCss('/css/experience/components/commerceAssets/campaignBanner.css');
    assets.addJs('/js/campaignBanner.js');

    return new Template('experience/components/commerce_assets/campaignBanner').render(model).text;
};
