'use strict';

var HashMap = require('dw/util/HashMap');
var Template = require('dw/util/Template');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var Resource = require('dw/web/Resource');

/**
 * @param {dw.experience.ComponentScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
    var model = new HashMap();

    if (!PageRenderHelper.isInEditMode()) {
        var assets = require('*/cartridge/scripts/assets.js');
        assets.addJs('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js');
        assets.addJs('https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/ScrollMagic.min.js');
        assets.addJs('https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/plugins/animation.gsap.min.js');
        assets.addCss('https://use.typekit.net/mbp5veb.css');
        assets.addJs('/js/hastens/grandVividusPresentation.js');
        assets.addCss('/css/hastens/grandVividusPresentation.css');
    }

    model.editMode = PageRenderHelper.isInEditMode();
    model.blockId = context.getComponent().getID();

    model.texts = {
        intro: context.content.intro,
        quote: context.content.quote,
        quoteBy: context.content.quoteBy,
        masterCraftmanshipHeading: context.content.masterCraftmanshipHeading,
        shagreenHeading: context.content.shagreenHeading,
        shagreenBody: context.content.shagreenBody,
        goldenBrassHeading: context.content.goldenBrassHeading,
        goldenBrassBody: context.content.goldenBrassBody,
        bedFabricHeading: context.content.bedFabricHeading,
        bedFabricBody: context.content.bedFabricBody,
        tannedLeatherHeading: context.content.tannedLeatherHeading,
        tannedLeatherBody: context.content.tannedLeatherBody,
        nubuckHeading: context.content.nubuckHeading,
        nubuckBody: context.content.nubuckBody,
    };

    return new Template('experience/components/grandVividusPresentation').render(model).text;
};
