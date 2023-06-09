'use strict';

var Resource = require('dw/web/Resource');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('DesignerTextStory', function(context) {
    return {
        text: {
            by: Resource.msg('by', 'hastens', null),
            collection: context.content.collection || null,
            designer: context.content.designer || null,
            heading: context.content.heading || null,
            body: context.content.body || null,
        },
        link: {
            text: context.content.linkText || null,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
    };
});
