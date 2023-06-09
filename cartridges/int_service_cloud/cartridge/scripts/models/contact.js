'use strict';

/**
 * @module models/contact
 */

/**
 * @type {dw.system.Transaction}
 */
const Transaction = require('dw/system/Transaction');

/**
 * Contact class
 * @param {dw.customer.Customer} [customer] Customer object
 * @param {dw.customer.Profile} [profile] Profile object
 * @constructor
 * @alias module:models/contact~Contact
 */
function Contact(customer, profile) {
    if ((empty(customer) || empty(customer.getProfile())) && empty(profile)) {
        throw new Error('Contact requires a registered customer profile to continue.');
    }

    /**
     * @type {string} The object type represented in Service Cloud
     */
    this.type = 'Contact';

    /**
     * @type {dw.customer.Profile}
     */
    this.profile = !empty(profile) ? profile : customer.getProfile();
}

/**
 * @alias module:models/contact~Contact#prototype
 */
Contact.prototype = {
    /**
     * Builds up a formatted object for JSON.stringify()
     *
     * @returns {Object}
     */
    toJSON: function () {
        return {
            first_name: this.profile.getFirstName(),
            last_name: this.profile.getLastName(),
            email: this.profile.getEmail(),
            phone_home: this.profile.getPhoneHome(),
            customer_id: this.profile.getCustomer().getID(),
            customer_no: this.profile.getCustomerNo(),
            address_street: (this.profile.addressBook.preferredAddress != null ? this.profile.addressBook.preferredAddress.address1 : null),
            address_city: (this.profile.addressBook.preferredAddress != null ? this.profile.addressBook.preferredAddress.city : null),
            address_postal_code: (this.profile.addressBook.preferredAddress != null ? this.profile.addressBook.preferredAddress.postalCode : null),
            address_state: (this.profile.addressBook.preferredAddress != null ? this.profile.addressBook.preferredAddress.stateCode : null),
            address_country: (this.profile.addressBook.preferredAddress != null ? this.profile.addressBook.preferredAddress.countryCode.displayValue : null),
            newsLetterRegistration: this.profile.custom.newsLetterRegistration
        };
    },

    /**
     * Update the {custom.sscSyncStatus} attribute with the given {status}
     *
     * @param {String} status
     */
    updateStatus: function (status) {
        var profile = this.profile;

        Transaction.wrap(function () {
            profile.custom.sscSyncStatus = status;
        });
    },

    /**
     * Update the {custom.sscid} attribute with the given {accountID}
     * Update the {custom.ssccid} attribute with the given {contactID}
     */
    updateExternalId: function (contactID, accountID) {
        var profile = this.profile;

        Transaction.wrap(function () {
            profile.custom.sscid = accountID;
            profile.custom.ssccid = contactID;
        });
    },

    /**
     * Update the {custom.sscSyncResponseText} attribute with the given {text}
     *
     * @param {String} text
     */
    updateSyncResponseText: function (text) {
        var profile = this.profile;

        Transaction.wrap(function () {
            var sscSyncResponseText = profile.custom.sscSyncResponseText.slice(0);
            sscSyncResponseText.push(text);
            profile.custom.sscSyncResponseText = sscSyncResponseText;
        });
    }
};

module.exports = Contact;
