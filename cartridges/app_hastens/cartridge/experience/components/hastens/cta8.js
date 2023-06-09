'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var StringHelper = require('~/cartridge/experience/utilities/StringHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('FullwidthCTA', function(context) {
    var headingSize = context.content.headingSize ? context.content.headingSize.value : 'md';
    var theme = context.content.theme ? context.content.theme.value : 'primary-1';
    var position = context.content.position ? context.content.position.value : 'center-center';
    var mobilePosition = context.content.mobilePosition ? context.content.mobilePosition.value : 'inherit';
    var textAlign = context.content.textAlign ? context.content.textAlign.value : 'center';
    var mobileTextAlign = context.content.mobileTextAlign ? context.content.mobileTextAlign.value : 'inherit';

    return {
        trackingId: StringHelper.makeAlphanumeric(context.content.trackingId ? context.content.trackingId.value : context.content.trackingId),
        text: {
            heading: context.content.heading,
            body: context.content.body,
        },
        headingSize: headingSize,
        desktopTextPosition: position,
        mobileTextPosition: mobilePosition === 'inherit' ? convertTextPosition(position) : mobilePosition,
        desktopTextAlign: textAlign,
        mobileTextAlign: mobileTextAlign === 'inherit' ? textAlign : mobileTextAlign,
        textShadow: context.content.textShadow,
        theme: theme,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        buttonAppearance: context.content.buttonAppearance ? context.content.buttonAppearance.value : 'standard',
        customBackgroundColor: context.content.backgroundColor,
        backgroundImage: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.tabletImage,
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
    };
});

function convertTextPosition(textPosition) {
    return textPosition.split('-')[1];
}
