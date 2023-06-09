'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('IntroductionText', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body,
            quote: context.content.quote,
            quoteFooter: context.content.quoteFooter,
            quoteFooterSupport: context.content.quoteFooterSupport,
        }
    };
});
