'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('SupremeCampaign', function(context) {

    var assets = require('*/cartridge/scripts/assets.js');
    assets.addJsLib('https://cdn.jsdelivr.net/npm/focus-visible@5.2.0/dist/focus-visible.min.js');
    assets.addJsLib('https://cdn.jsdelivr.net/gh/charpstar/InPlace/model-viewer.js', null, 'module');
    assets.addJsLib('https://cdn.jsdelivr.net/gh/charpstar/InPlace/charpstar-viewer.js');

    return {
        text: {
            heading: context.content.heading,
            body: context.content.body,
            footer1: context.content.footer,
            footer2: context.content.footer2,
            footer3: context.content.footer3,
        },
        link: {
            text: context.content.linkText,
            url: context.content.linkUrl,
        },
        contactEmail: context.content.contactEmail,
        video: context.content.video,
        videoImage: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.videoImage,
            }),
        },
    };
});
