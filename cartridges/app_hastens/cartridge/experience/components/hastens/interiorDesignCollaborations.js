'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('InteriorDesignCollaborations', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body ? context.content.body.value : null,
            buttonSubmit: Resource.msg('buttons.submit', 'hastens', null),
            labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
            labelLastName: Resource.msg('forms.lastName', 'hastens', null),
            labelCompanyName: Resource.msg('forms.companyname', 'hastens', null),
            labelCompanyRegNumber: Resource.msg('forms.companyregnumber', 'hastens', null),
            labelStreetAddress: Resource.msg('forms.streetaddress', 'hastens', null),
            labelZip: Resource.msg('forms.postcode', 'hastens', null),
            labelCity: Resource.msg('forms.city', 'hastens', null),
            labelCountry: Resource.msg('forms.country', 'hastens', null),
            labelPhone: Resource.msg('forms.phone', 'hastens', null),
            labelMobilePhone: Resource.msg('forms.mobilephone', 'hastens', null),
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            labelWebsite: Resource.msg('forms.website', 'hastens', null),
            labelStore: Resource.msg('forms.store', 'hastens', null),
            mainClients: Resource.msg('interiordesigncollab.mainclients', 'hastens', null),
            private: Resource.msg('interiordesigncollab.private', 'hastens', null),
            commercial: Resource.msg('interiordesigncollab.commercial', 'hastens', null),
            emailConsent: Resource.msg('forms.emailconsent', 'hastens', null),
            thankyouMessage: Resource.msg('interiordesigncollab.thankyoumessage', 'hastens', null),
        },
    };
});
