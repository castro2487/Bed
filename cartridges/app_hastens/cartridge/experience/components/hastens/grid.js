'use strict';

var HashMap = require('dw/util/HashMap');
var Template = require('dw/util/Template');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * @param {dw.experience.ComponentScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
    var model = new HashMap();
    model.regions = PageRenderHelper.getRegionModelRegistry(context.component);
    var columns = context.content.columns ? context.content.columns.value : 'two';
    var width = context.content.adjustWidth ? context.content.adjustWidth.value : 'default';

    var className = [
        'experience-columns--' + columns,
        'adjust-width--' + width,
        context.content.removeOuterVerticalSpacing ? 'no-outer-vertical-padding-mobile' : '',
        context.content.gridGap ? 'grid-gap--' + context.content.gridGap.value: '',
    ];

    var containerClass = [
        context.content.topSpacing ? context.content.topSpacing.value : '',
        context.content.spacingSize ? 'spacing-size--' + context.content.spacingSize.value : '',
    ];

    model.containerClassName = className.filter(function (item) {
        return !!item
    }).join(' ');

    model.block = JSON.stringify({
        scaleWidthRecommendation: getScaleWidthRecommendation(columns),
        containerClass: containerClass.filter(function (item) { return !!item }),
    });

    model.heading = context.content.heading || null;

    return new Template('experience/components/grid').render(model).text;
};

function getScaleWidthRecommendation(columns) {
    switch(columns) {
        case 'two':
            return {
                mobile: 768,
                tablet: 750,
                desktop: 750,
            };
        case 'three':
            return {
                mobile: 768,
                tablet: 500,
                desktop: 500,
            };
    }
}
