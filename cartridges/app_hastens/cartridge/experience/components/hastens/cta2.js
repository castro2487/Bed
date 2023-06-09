'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var StringHelper = require('~/cartridge/experience/utilities/StringHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BannerCTA', function(context) {
    return {
        trackingId: StringHelper.makeAlphanumeric(context.content.trackingId ? context.content.trackingId.value : context.content.trackingId),
        text: {
            heading: context.content.heading,
            body: context.content.body,
        },
        textPosition: context.content.position ? context.content.position.value : 'left',
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        buttonAppearance: context.content.buttonAppearance ? context.content.buttonAppearance.value : null,
        image: {
            sizes: ImageHelper.getSizes(
                {
                    mobile: context.content.mobileImage,
                    tablet: context.content.tabletImage,
                    desktop: context.content.image,
                },
                context.content.disableImageInheritance
            ),
            alt: context.content.imageAlt,
        },
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
            disablePageReload: context.content.disablePageReload,
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
