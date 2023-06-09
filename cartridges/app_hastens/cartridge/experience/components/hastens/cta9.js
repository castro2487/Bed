'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('WaitListCTA', function(context) {
    return {
        body: context.content.body,
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
    };
});
