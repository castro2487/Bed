'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('RestoreSignup', function (context) {
    var containerClass = [
        context.content.topSpacing ? context.content.topSpacing.value : '',
        context.content.spacingSize ? 'spacing-size--' + context.content.spacingSize.value : '',
    ];

    return {
        text: {
            text1: context.content.text2,
            text2: context.content.text3,
            text3: context.content.text4,
            heading: context.content.heading,
            subHeading: context.content.text1,
            email: Resource.msg('forms.email', 'hastens', null),
            fullName: Resource.msg('forms.fullName', 'hastens', null),
            sendRequest: Resource.msg('buttons.sendrequest', 'hastens', null),
            agreement: Resource.msg('campaign.form.agreement', 'hastens', null),
            buttonText: context.content.buttonText,
        },
        format: context.content.format ? context.content.format.value : 1,
        mailto: context.content.mailto ? context.content.mailto.value : 'jussi',
        image: {
            sizes: ImageHelper.getSizes({
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
        containerClass: containerClass.filter(function (item) { return !!item }),
    };
});
