'use strict';
var baseOrderModel = module.superModule;

var AddressModel = require('*/cartridge/models/address');
var BillingModel = require('*/cartridge/models/billing');
var PaymentModel = require('*/cartridge/models/payment');

var ShippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');

var DEFAULT_MODEL_CONFIG = {
    numberOfLineItems: '*'
};

/**
 * Returns the matching address ID or UUID for a billing address
 * @param {dw.order.Basket} basket - line items model
 * @param {Object} customer - customer model
 * @return {string|boolean} returns matching ID or false
*/
function getAssociatedAddress(basket, customer, currentCountry) {
    var address = basket.billingAddress;
    var matchingId;
    var anAddress;

    if (address && (address.getCountryCode() !== currentCountry)){
        address = null;
    } 

    if (!address) return false;

    // First loop through all shipping addresses
    for (var i = 0, ii = basket.shipments.length; i < ii; i++) {
        anAddress = basket.shipments[i].shippingAddress;

        if (anAddress && anAddress.isEquivalentAddress(address)) {
            matchingId = basket.shipments[i].UUID;
            break;
        }
    }

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
 * Extend Order class to include zenkraftOrderShippingStatus
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket/order
 * @param {Object} options - The current order's line items
 */
function OrderModel(lineItemContainer, options, filterByCountry) {
    if (!lineItemContainer) {
        this.zenkraftOrderShippingStatus = null;
        this.zenkraftOrderTrackingNumber = null;
    } else {
        this.zenkraftOrderShippingStatus = ('zenkraftOrderShippingStatus' in lineItemContainer.custom && lineItemContainer.custom.zenkraftOrderShippingStatus) ? 
            lineItemContainer.custom.zenkraftOrderShippingStatus : null;
        this.zenkraftOrderTrackingNumber = ('zenkraftOrderTrackingNumber' in lineItemContainer.custom && lineItemContainer.custom.zenkraftOrderTrackingNumber) ? 
        lineItemContainer.custom.zenkraftOrderTrackingNumber : null;
    }
    options.containerView = options.containerView ? options.containerView : 'order';
    baseOrderModel.call(this, lineItemContainer, options);

    if (filterByCountry && lineItemContainer) {
        var safeOptions = options || {};
        var countryCode = safeOptions.countryCode || null;
        var modelConfig = safeOptions.config || DEFAULT_MODEL_CONFIG;

        var customer = safeOptions.customer || lineItemContainer.customer;
        var paymentModel = new PaymentModel(lineItemContainer, customer, countryCode);

        var shippingModels = ShippingHelpers.getShippingModels(lineItemContainer, customer, safeOptions.containerView, safeOptions, countryCode);

        var billingAddress = lineItemContainer.billingAddress;
        if (billingAddress && (billingAddress.countryCode.value !== countryCode)){
            billingAddress = null;
        }
        
        var billingAddressModel = new AddressModel(billingAddress);

        var associatedAddress = getAssociatedAddress(lineItemContainer, customer, countryCode);

        var billingModel = new BillingModel(billingAddressModel, paymentModel, associatedAddress);

        if (modelConfig.numberOfLineItems === '*') {
            this.shipping = shippingModels;
            this.billing = billingModel;
        }
    }
}

module.exports = OrderModel;
