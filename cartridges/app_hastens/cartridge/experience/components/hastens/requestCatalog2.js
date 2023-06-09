'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('RequestCatalog2', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body,
            confirmHeader: context.content.confirmationHeading,
            confirmBody: context.content.confirmationBody,
            buttonClose: Resource.msg('buttons.close', 'hastens', null),
            buttonRequestCatalog: context.content.buttonText,
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
