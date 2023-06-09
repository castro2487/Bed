'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('RequestCatalog', function(context) {
    var Resource = require('dw/web/Resource');

    return {
        bannerImage: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.tabletImage,
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
        text: {
            bannerHeading: context.content.bannerHeading,
            bannerBody: context.content.bannerBody,
            bannerButton: context.content.bannerButtonText,
            formHeader: context.content.formHeading,
            formSubHeader: context.content.formBody,
            confirmHeader: context.content.confirmationHeading,
            confirmBody: context.content.confirmationBody,
            buttonClose: Resource.msg('buttons.close', 'hastens', null),
            buttonCancel: Resource.msg('buttons.cancel', 'hastens', null),
            buttonSend: Resource.msg('buttons.sendrequest', 'hastens', null),
            labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
            labelLastName: Resource.msg('forms.lastName', 'hastens', null),
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
            labelStreetAddress: Resource.msg('forms.streetaddress', 'hastens', null),
            labelApartment: Resource.msg('forms.apartment', 'hastens', null),
            labelState: Resource.msg('forms.state', 'hastens', null),
            labelCity: Resource.msg('forms.city', 'hastens', null),
            labelCountry: Resource.msg('forms.country', 'hastens', null),
            labelZip: Resource.msg('forms.postcode', 'hastens', null),
            labelLanguage: Resource.msg('forms.language', 'hastens', null),
            labelNewsletter: Resource.msg('forms.newsletter', 'hastens', null),
            labelRequired: Resource.msg('forms.required', 'hastens', null),
            labelConsent: Resource.msg('forms.consent', 'hastens', null),
        },
        bannerTheme: context.content.bannerTheme ? context.content.bannerTheme.value : 'primary-1',
        bannerButtonColor: context.content.bannerButtonColor ? context.content.bannerButtonColor.value : null,
        hideBanner: context.content.hideBanner || false,
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
