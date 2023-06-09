'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('RequestCatalog4', function(context) {
    return {
        text: {
            bannerHeading: context.content.bannerHeading,
            bannerHeading2: context.content.bannerHeading2,
            bannerIntro: context.content.bannerIntro,
            bannerBody: context.content.bannerBody,
            bannerButton: context.content.bannerButtonText,
            formHeader: Resource.msg('requestcatalog.form.header', 'hastens', null),
            formSubHeader: Resource.msg('requestcatalog.form.subheader', 'hastens', null),
            confirmHeader: Resource.msg('requestcatalog.confirm.header', 'hastens', null),
            confirmBody: Resource.msg('requestcatalog.confirm.body', 'hastens', null),
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
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
