'use strict';

var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

/**
 * @param {dw.experience.ComponentScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
    var regions = PageRenderHelper.getRegionModelRegistry(context.component);
    var splitPoint = context.content.splitPoint ? context.content.splitPoint.value : '25';

    var className = [
        'experience-split--' + splitPoint,
        context.content.mobileReverse ? ' mobile-reverse' : '',
        context.content.removeOuterVerticalSpacing ? ' no-outer-vertical-padding-mobile' : '',
    ];

    var finalClassName = className.filter(function (item) {
        return !!item
    }).join(' ');

    var block = JSON.stringify({
        scaleWidthRecommendation: [
            getScaleWidthRecommendation(parseInt(splitPoint)),
            getScaleWidthRecommendation(100 - parseInt(splitPoint)),
        ],
        containerClass: context.content.topSpacing ? [context.content.topSpacing.value] : [],
    });

    return regions.items.setClassName(finalClassName).setAttribute('data-hastens-wrapper-block', block).render();
};

function getScaleWidthRecommendation(splitPoint) {
    switch(splitPoint) {
        case 25:
            return {
                mobile: 768,
                tablet: 400,
                desktop: 400,
            };
        case 50:
            return {
                mobile: 768,
                tablet: 750,
                desktop: 750,
            };
        case 75:
            return {
                mobile: 768,
                tablet: 1100,
                desktop: 1100,
            };
    }
}
