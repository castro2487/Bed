'use strict';

var AddressModel = require('*/cartridge/models/address');
var URLUtils = require('dw/web/URLUtils');

/**
 * Creates a plain object that contains profile and raw profile information
 * @param {Object} profile - current customer's profile
 * @param {Object} rawProfile - current customer's raw profile
 * @returns {Object} an object that contains information about the current customer's profile
 */
function getProfile(profile, rawProfile) {
    var result;
    if (profile) {
        result = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            prefix: rawProfile.custom.prefix,
            prefixCountry: rawProfile.custom.prefixCountry,
            phone: profile.phone.slice(rawProfile.custom.prefix ? rawProfile.custom.prefix.length : 0),
            password: '********',
            newsLetterRegistration: rawProfile.custom.newsLetterRegistration
        };
    } else {
        result = null;
    }
    return result;
}

/**
 * Creates an array of plain object that contains address book addresses, if any exist
 * @param {Object} addressBook - target customer
 * @returns {Array<Object>} an array of customer addresses
 */
function getAddresses(addressBook, currentCountry) {
    var result = [];
    if (addressBook) {
        for (var i = 0, ii = addressBook.addresses.length; i < ii; i++) {
            if (!currentCountry || (addressBook.addresses[i].countryCode.value === currentCountry)) {
                result.push(new AddressModel(addressBook.addresses[i]).address);
            }
        }
    }

    return result;
}

/**
 * Creates a plain object that contains the customer's preferred address
 * @param {Object} addressBook - target customer
 * @returns {Object} an object that contains information about current customer's preferred address
 */
function getPreferredAddress(addressBook, currentCountry) {
    var result = null;
    var filteredAddressBook = [];
    if (addressBook) {
        for (var i = 0, ii = addressBook.addresses.length; i < ii; i++) {
            if (addressBook.addresses[i].countryCode.value === currentCountry) {
                filteredAddressBook.push(addressBook.addresses[i]);
            }
        }
    }
    if (filteredAddressBook.length > 0 && addressBook.preferredAddress) {
        var preferredAddress;
        if (addressBook.preferredAddress.countryCode.value === currentCountry) {
            preferredAddress = addressBook.preferredAddress;
        } else {
            preferredAddress = filteredAddressBook[0];
        }
        result = new AddressModel(addressBook.preferredAddress).address;
    }

    return result;
}

/**
 * Creates a plain object that contains payment instrument information
 * @param {Object} wallet - current customer's wallet
 * @returns {Object} object that contains info about the current customer's payment instrument
 */
function getPayment(wallet) {
    if (wallet) {
        var paymentInstruments = wallet.paymentInstruments;
        var paymentInstrument = paymentInstruments[0];

        if (paymentInstrument) {
            return {
                maskedCreditCardNumber: paymentInstrument.maskedCreditCardNumber,
                creditCardType: paymentInstrument.creditCardType,
                creditCardExpirationMonth: paymentInstrument.creditCardExpirationMonth,
                creditCardExpirationYear: paymentInstrument.creditCardExpirationYear
            };
        }
    }
    return null;
}

/**
 * Creates a plain object that contains payment instrument information
 * @param {Object} userPaymentInstruments - current customer's paymentInstruments
 * @returns {Object} object that contains info about the current customer's payment instruments
 */
function getCustomerPaymentInstruments(userPaymentInstruments) {
    var paymentInstruments;

    paymentInstruments = userPaymentInstruments.map(function (paymentInstrument) {
        var result = {
            creditCardHolder: paymentInstrument.creditCardHolder,
            maskedCreditCardNumber: paymentInstrument.maskedCreditCardNumber,
            creditCardType: paymentInstrument.creditCardType,
            creditCardExpirationMonth: paymentInstrument.creditCardExpirationMonth,
            creditCardExpirationYear: paymentInstrument.creditCardExpirationYear,
            UUID: paymentInstrument.UUID
        };

        result.cardTypeImage = {
            src: URLUtils.staticURL('/images/' +
                paymentInstrument.creditCardType.toLowerCase().replace(/\s/g, '') +
                '-dark.svg'),
            alt: paymentInstrument.creditCardType
        };

        return result;
    });

    return paymentInstruments;
}

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel, currentCountry) {
    this.profile = getProfile(currentCustomer.profile, currentCustomer.raw.profile);
    this.addresses = getAddresses(currentCustomer.addressBook, currentCountry);
    this.preferredAddress = addressModel || getPreferredAddress(currentCustomer.addressBook, currentCountry);
    this.orderHistory = orderModel;
    this.payment = getPayment(currentCustomer.wallet);
    this.registeredUser = currentCustomer.raw.authenticated && currentCustomer.raw.registered;
    this.isExternallyAuthenticated = currentCustomer.raw.externallyAuthenticated;
    this.customerPaymentInstruments = currentCustomer.wallet
        && currentCustomer.wallet.paymentInstruments
        ? getCustomerPaymentInstruments(currentCustomer.wallet.paymentInstruments)
        : null;
}

account.getCustomerPaymentInstruments = getCustomerPaymentInstruments;

module.exports = account;
