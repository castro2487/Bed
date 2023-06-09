'use strict';

/**
 * creates a plain object that contains address information
 * @param {dw.order.OrderAddress} addressObject - User's address
 * @returns {Object} an object that contains information about the users address
 */
function createAddressObject(addressObject) {
    var result;
    if (addressObject) {
        var prefix = Object.hasOwnProperty.call(addressObject, 'raw')
                ? addressObject.raw.custom.prefix : addressObject.custom.prefix;

        var phone = addressObject.phone;
        // remove prefix from phone
        if (phone && phone[0] === '+') {
            phone = phone.slice(prefix ? prefix.length : 0);
        }

        result = {
            address1: addressObject.address1,
            address2: addressObject.address2,
            city: addressObject.city,
            firstName: addressObject.firstName,
            lastName: addressObject.lastName,
            ID: Object.hasOwnProperty.call(addressObject, 'ID')
                ? addressObject.ID : null,
            addressId: Object.hasOwnProperty.call(addressObject, 'ID')
                ? addressObject.ID : null,
            prefix: prefix,
            prefixCountry: Object.hasOwnProperty.call(addressObject, 'raw')
                ? addressObject.raw.custom.prefixCountry : addressObject.custom.prefixCountry,
            phone: phone,
            postalCode: addressObject.postalCode,
            stateCode: addressObject.stateCode,
            jobTitle: addressObject.jobTitle,
            postBox: addressObject.postBox,
            salutation: addressObject.salutation,
            secondName: addressObject.secondName,
            companyName: addressObject.companyName,
            suffix: addressObject.suffix,
            suite: addressObject.suite,
            title: addressObject.title
        };

        if (result.stateCode === 'undefined') {
            result.stateCode = '';
        }

        if (Object.hasOwnProperty.call(addressObject, 'countryCode')) {
            result.countryCode = {
                displayValue: addressObject.countryCode.displayValue,
                value: addressObject.countryCode.value.toUpperCase()
            };
        }
    } else {
        result = null;
    }
    return result;
}

/**
 * Address class that represents an orderAddress
 * @param {dw.order.OrderAddress} addressObject - User's address
 * @constructor
 */
function address(addressObject) {
    this.address = createAddressObject(addressObject);
}

module.exports = address;
