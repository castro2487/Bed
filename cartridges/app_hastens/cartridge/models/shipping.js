'use strict';

var baseOrderModel = module.superModule;

var AddressModel = require('*/cartridge/models/address');

/**
 * Returns the matching address ID or UUID for a shipping address
 * @param {dw.order.Shipment} shipment - line items model
 * @param {Object} customer - customer model
 * @return {string|boolean} returns matching ID or false
*/
function getAssociatedAddress(shipment, customer, currentCountry) {
    var address = shipment ? shipment.shippingAddress : null;
    var matchingId;
    var anAddress;

    if (shipment && shipment.shippingAddress && (shipment.shippingAddress.countryCode.value !== currentCountry)) {
        address = null;
    }    

    if (!address) return false;

    // If we still haven't found a match, then loop through customer addresses to find a match
    if (!matchingId && customer && customer.addressBook && customer.addressBook.addresses) {
        for (var j = 0, jj = customer.addressBook.addresses.length; j < jj; j++) {
            anAddress = customer.addressBook.addresses[j];

            if (anAddress && anAddress.isEquivalentAddress(address)) {
                matchingId = anAddress.ID;
                break;
            }
        }
    }

    return matchingId;
}

/**
 * Returns a boolean indicating if the address is empty
 * @param {dw.order.Shipment} shipment - A shipment from the current basket
 * @returns {boolean} a boolean that indicates if the address is empty
 */
function emptyAddress(shipment) {
    if (shipment && shipment.shippingAddress) {
        return ['firstName', 'lastName', 'address1', 'address2', 'phone', 'city', 'postalCode', 'stateCode'].some(function (key) {
            return shipment.shippingAddress[key];
        });
    }
    return false;
}

/**
 * @constructor
 * @classdesc Model that represents shipping information
 *
 * @param {dw.order.Shipment} shipment - the default shipment of the current basket
 * @param {Object} address - the address to use to filter the shipping method list
 * @param {Object} customer - the current customer model
 * @param {string} containerView - the view of the product line items (order or basket)
 */
 function ShippingModel(shipment, address, customer, containerView, currentCountry) {

    baseOrderModel.call(this, shipment, address, customer, containerView);

    this.matchingAddressId = getAssociatedAddress(shipment, customer, currentCountry);

    // Optional properties
    if (emptyAddress(shipment)) {
        if (!currentCountry || (shipment.shippingAddress.countryCode.value === currentCountry)) {
            this.shippingAddress = new AddressModel(shipment.shippingAddress).address;
        } else {
            this.shippingAddress = address;
        }
    } else {
        this.shippingAddress = address;
    }
}

module.exports = ShippingModel;