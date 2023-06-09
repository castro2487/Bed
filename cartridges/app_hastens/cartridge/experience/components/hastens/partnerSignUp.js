'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

module.exports.render = RenderHelper.renderStandardComponentWithContext('PartnerSignUp', function(context) {
    return {
        privacyLinkUrl: URLUtils.url('Page-Show', 'cid', 'privacy-policy').toString(),
        text: {
            heading: context.content.formHeading,
            body: context.content.formBody,
            confirmationHeading: context.content.confirmationHeading,
            confirmationBody: context.content.confirmationBody,
            labelCountry: Resource.msg('forms.country', 'hastens', null),
            labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
            labelLastName: Resource.msg('forms.lastName', 'hastens', null),
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
            labelAboutYou: Resource.msg('forms.aboutYou', 'hastens', null),
            labelCommunication: Resource.msg('forms.communication', 'hastens', null),
            labelRequired: Resource.msg('forms.required', 'hastens', null),
            labelPrivacyPolicy: Resource.msg('forms.privacyPolicy', 'hastens', null),
            buttonClose: Resource.msg('buttons.close', 'hastens', null),
            buttonSubmit: Resource.msg('buttons.send', 'hastens', null),
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
