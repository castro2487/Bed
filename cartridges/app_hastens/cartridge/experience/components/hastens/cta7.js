'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('RequestCatalogCTA', function(context) {
    return {
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        text: {
            heading: context.content.heading,
            intro: context.content.intro,
            catalogText1: context.content.catalogText1,
            catalogText2: context.content.catalogText2,
            catalogText3: context.content.catalogText3,
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
