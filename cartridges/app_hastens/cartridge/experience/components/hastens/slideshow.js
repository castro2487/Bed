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

    var assets = require('*/cartridge/scripts/assets.js');
    assets.addJs('/js/hastens/slideshow.js');
    assets.addCss('/css/hastens/slideshow.css');

    var theme = context.content.theme ? context.content.theme.value : 'primary-1';
    var animation = context.content.animation ?  context.content.animation.value : 'default';
    var adjustWidth = context.content.adjustWidth ? context.content.adjustWidth.value : 'default';

    var containerClassName = [
        'has-slideshow',
        theme ? 'has-background theme--' + theme : null,
        context.content.heading || context.content.body ? 'padded' : null,
        animation === 'default' ? 'animation--fade' : null,
        'adjust-width--' + adjustWidth,
    ];

    model.body = context.content.body || null;
    model.heading = context.content.heading || null;
    model.showArrows = context.content.showArrows || false;
    model.containerClassName = containerClassName.filter(function (item) { return !!item; }).join(' ');
    model.slideshowOptions = JSON.stringify({
        animation: animation,
    });

    return new Template('experience/components/slideshow').render(model).text;
};
