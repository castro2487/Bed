'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('LargeCTA', function(context) {
    return {
        text: {
            heading: context.content.heading,
            afterHeading: context.content.afterHeading,
            body: context.content.body,
            footer: context.content.footer,
        },
        headingSize: context.content.headingSize ? context.content.headingSize.value : 'xl',
        verticalAlignment: context.content.verticalAlignment ? context.content.verticalAlignment.value: null,
        verticalAlignmentMobile: context.content.verticalAlignmentMobile ? context.content.verticalAlignmentMobile.value: null,
        horizontalAlignment: context.content.horizontalAlignment ? context.content.horizontalAlignment.value: 'center',
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        buttonAppearance: context.content.buttonAppearance ? context.content.buttonAppearance.value : null,
        pushButtonToBottom: context.content.pushButtonToBottom ? context.content.pushButtonToBottom : null,
        pushButtonToBottomOnMobile: context.content.pushButtonToBottomOnMobile ? context.content.pushButtonToBottomOnMobile : null,
        textShadow: context.content.textShadow,
        image: {
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
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
