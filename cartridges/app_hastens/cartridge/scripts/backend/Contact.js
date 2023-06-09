'use strict';

const helpers = require('./BackendHelpers');

let Contact = {
    // Service constants
    SERVICE: {
        EMAIL_CONSENT: 'hastens.contact.email-consent',
    },

    emailConsent: function (data) {
        return helpers.callApi(this.SERVICE.EMAIL_CONSENT, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Contact;
