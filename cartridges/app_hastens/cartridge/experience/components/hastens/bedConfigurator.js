'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BedConfigurator', function(context) {
    return {
        text: {
            bannerHeading: context.content.bannerHeading,
            afterBannerHeading: context.content.afterBannerHeading,
            bannerBody: context.content.bannerBody,
            bannerButton: context.content.bannerButton,
        },
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
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
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
