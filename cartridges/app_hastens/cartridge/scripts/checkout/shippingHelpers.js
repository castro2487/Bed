'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var ShippingModel = require('*/cartridge/models/shipping');

// Public (class) static model functions

/**
 * Plain JS object that represents a DW Script API dw.order.ShippingMethod object
 * @param {dw.order.Basket} currentBasket - the target Basket object
 * @param {Object} customer - the associated Customer Model object
 * @param {string} containerView - view of the shipping models (order or basket)
 * @returns {dw.util.ArrayList} an array of ShippingModels
 */
 function getShippingModels(currentBasket, customer, containerView, safeOptions, currentCountry) {
    var shipments = currentBasket ? currentBasket.getShipments() : null;

    if (!shipments) return [];

    return collections.map(shipments, function (shipment) {
        return new ShippingModel(shipment, null, customer, containerView, currentCountry);
    });
}

/**
 * Retrieve raw address JSON object from request.form
 * @param {Request} req - the DW Request object
 * @returns {Object} - raw JSON representing address form data
 */
 function getAddressFromRequest(req) {
    var phone = req.form.phone;
    if (phone && phone[0] !== '+') {
        phone = req.form.prefix + phone;
    }
    return {
        firstName: req.form.firstName,
        lastName: req.form.lastName,
        address1: req.form.address1,
        address2: req.form.address2,
        city: req.form.city,
        stateCode: req.form.stateCode,
        postalCode: req.form.postalCode,
        countryCode: req.form.countryCode,
        phone: phone,
        prefix: req.form.prefix,
        prefixCountry: req.form.prefixCountry
    };
}

module.exports = {
    getShippingModels: getShippingModels,
    getAddressFromRequest: getAddressFromRequest
};

Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});