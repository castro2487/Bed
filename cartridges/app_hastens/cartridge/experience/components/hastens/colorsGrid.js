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
    model.leftText = context.content.leftText || null;
    model.rightText = context.content.rightText || null;
    model.heading = context.content.heading || null;
    model.gridHeading = context.content.gridHeading || '';

    return new Template('experience/components/colorsGrid').render(model).text;
};
