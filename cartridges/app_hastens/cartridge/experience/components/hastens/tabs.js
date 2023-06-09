'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * @param {dw.experience.ComponentScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
    var model = new HashMap();

    model.regions = PageRenderHelper.getRegionModelRegistry(context.component);
    model.tabs = [
        {
            region: 'tab1',
            text: context.content.linkText1 || '',
            slug: context.content.linkSlug1 || '1',
            pageTitle: context.content.pageTitle1 || '',
        },
        {
            region: 'tab2',
            text: context.content.linkText2 || '',
            slug: context.content.linkSlug2 || '2',
            pageTitle: context.content.pageTitle2 || '',
        },
    ];

    var assets = require('*/cartridge/scripts/assets.js');
    assets.addJs('/js/hastens/tabs.js');
    assets.addCss('/css/hastens/tabs.css');

    return new Template('experience/components/tabs').render(model).text;
};
