'use strict';
var base = module.superModule;

var BasketMgr = require('dw/order/BasketMgr');
var OrderMgr = require('dw/order/OrderMgr');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var Order = require('dw/order/Order');
var Transaction = require('dw/system/Transaction');
var Status = require('dw/system/Status');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');

var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');

/**
 * Attempts to create an order from the current basket
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {dw.order.Order} The order object created from the current basket
 */
function createOrder(currentBasket) {
    var order;

    try {
        order = Transaction.wrap(function () {
            // return OrderMgr.createOrder(currentBasket);
            var order = OrderMgr.createOrder(currentBasket);
            if (!currentBasket.customer.anonymous) {
                if(currentBasket.customer.profile.custom.sscid){
                    order.custom.sscAccountid = currentBasket.customer.profile.custom.sscid;
                }
            }

            //manage newsLetterRegistration in order and profile objects
            if((!currentBasket.customer.anonymous 
                && currentBasket.customer.profile 
                && !currentBasket.customer.profile.custom.newsLetterRegistration)
                || (currentBasket.customer.anonymous)) {

                order.custom.newsLetterRegistration = currentBasket.custom.newsLetterRegistration;

                if(!currentBasket.customer.anonymous) {
                    var profile = currentBasket.customer.getProfile()
                    profile.custom.newsLetterRegistration = currentBasket.custom.newsLetterRegistration;
                }
            }

            //add credit card information
            order.custom.creditCardType = currentBasket.paymentInstrument.creditCardType || '';
            order.custom.maskedCreditCardNumber = currentBasket.paymentInstrument.maskedCreditCardNumber || '';

            //initialize order export error counter
            order.custom.orderExportErrorCounter = 0;

            //add terms and condition flag
            order.custom.termsAndConditions = currentBasket.custom.termsAndConditions;

            //initialize Avatax zero tax error
            order.custom.ATZeroTaxError = currentBasket.custom.ATZeroTaxError;

            var product;
            Transaction.wrap(function () {
                for (var i = 0; i < order.productLineItems.length; i++) {
                    product = currentBasket.productLineItems[i].product;
                    order.productLineItems[i].custom.sscProductId = product.custom.sscProductId;
                }            
            });

            return order;
        });
    } catch (error) {
        return null;
    }
    return order;
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function placeOrder(order, fraudDetectionStatus) {
    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        if (fraudDetectionStatus.status === 'flag') {
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_NOTCONFIRMED);
        } else {
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        }

        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        result.error = true;
    }

    // Do export order upon confirmation
    // if (!result.error) {
    //     var OrderSubmitModel = require('int_order_submit/cartridge/models/orderSubmitModel');

    //     var orderSubmitResult = OrderSubmitModel.submitOrder(order);

    //     if (orderSubmitResult.success) {
    //         OrderSubmitModel.updateOrderExportStatus(order, orderSubmitResult.orderStatusFeedback);
    //     }

    //     if (orderSubmitResult.hasOwnProperty('orderHistoryLog')) {
    //         Transaction.wrap(function () {
    //             order.trackOrderChange(orderSubmitResult.orderHistoryLog);
    //         });
    //     }
    // }

    return result;
}

/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
function sendConfirmationEmail(order, locale) {
    var OrderModel = require('*/cartridge/models/order');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Locale = require('dw/util/Locale');

    var currentLocale = Locale.getLocale(locale);

    var orderModel = new OrderModel(order, { countryCode: currentLocale.country, containerView: 'order' });

    orderModel.shipping[0].selectedShippingMethod.estimatedArrivalTime = order.shipments[0].custom.estimatedArrivalTime;

    var Site = require('dw/system/Site');
    var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
    var avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

    var orderObject = {
        order: orderModel,
        netTaxation: avataxSettings && avataxSettings.taxCalculation,
        avataxEnabled: avataxEnabled
    };

    var emailObj = {
        to: order.customerEmail,
        subject: Resource.msg('subject.order.confirmation.email', 'order', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com',
        type: emailHelpers.emailTypes.orderConfirmation
    };

    emailHelpers.sendEmail(emailObj, 'checkout/confirmation/confirmationEmail', orderObject);
}

/**
 * Copies a CustomerAddress to a Shipment as its Shipping Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 * @param {dw.order.Shipment} [shipmentOrNull] - The target shipment
 */
function copyCustomerAddressToShipment(address, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;
    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(address.firstName);
        shippingAddress.setLastName(address.lastName);
        shippingAddress.setAddress1(address.address1);
        shippingAddress.setAddress2(address.address2);
        shippingAddress.setCity(address.city);
        shippingAddress.setPostalCode(address.postalCode);
        shippingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        shippingAddress.setCountryCode(countryCode.value);
        shippingAddress.custom.prefix = address.raw.custom.prefix;
        if (address.raw.custom.prefixCountry) {
            shippingAddress.custom.prefixCountry = address.raw.custom.prefixCountry.toUpperCase();
        }
        shippingAddress.setPhone(address.phone);
    });
}

/**
 * Copies a CustomerAddress to a Basket as its Billing Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 */
function copyCustomerAddressToBilling(address) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;

    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }

        billingAddress.setFirstName(address.firstName);
        billingAddress.setLastName(address.lastName);
        billingAddress.setAddress1(address.address1);
        billingAddress.setAddress2(address.address2);
        billingAddress.setCity(address.city);
        billingAddress.setPostalCode(address.postalCode);
        billingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        billingAddress.setCountryCode(countryCode.value);
        billingAddress.custom.prefix = address.raw.custom.prefix;
        if (address.raw.custom.prefixCountry) {
            billingAddress.custom.prefixCountry = address.raw.custom.prefixCountry.toUpperCase();
        }
        billingAddress.setPhone(address.phone);
    });
}

/**
 * Copies information from the shipping form to the associated shipping address
 * @param {Object} shippingData - the shipping data
 * @param {dw.order.Shipment} [shipmentOrNull] - the target Shipment
 */
function copyShippingAddressToShipment(shippingData, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;

    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(shippingData.address.firstName);
        shippingAddress.setLastName(shippingData.address.lastName);
        shippingAddress.setAddress1(shippingData.address.address1);
        shippingAddress.setAddress2(shippingData.address.address2);
        shippingAddress.setCity(shippingData.address.city);
        shippingAddress.setPostalCode(shippingData.address.postalCode);
        shippingAddress.setStateCode(shippingData.address.stateCode);
        var countryCode = shippingData.address.countryCode.value ? shippingData.address.countryCode.value : shippingData.address.countryCode;
        shippingAddress.setCountryCode(countryCode);
        shippingAddress.custom.prefix = shippingData.address.prefix;
        shippingAddress.custom.prefixCountry = shippingData.address.prefixCountry.toUpperCase();
        var phone =  shippingData.address.phone;
        // contcatenate prefix to phone if not already done
        if (phone && phone[0] !== '+') {
            phone =  shippingData.address.prefix + phone;
        }
        shippingAddress.setPhone(phone);

        ShippingHelper.selectShippingMethod(shipment, shippingData.shippingMethod);
    });
}

/**
 * Copies a raw address object to the baasket billing address
 * @param {Object} address - an address-similar Object (firstName, ...)
 * @param {Object} currentBasket - the current shopping basket
 */
function copyBillingAddressToBasket(address, currentBasket) {
    var billingAddress = currentBasket.billingAddress;

    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }

        billingAddress.setFirstName(address.firstName);
        billingAddress.setLastName(address.lastName);
        billingAddress.setAddress1(address.address1);
        billingAddress.setAddress2(address.address2);
        billingAddress.setCity(address.city);
        billingAddress.setPostalCode(address.postalCode);
        billingAddress.setStateCode(address.stateCode);
        billingAddress.setCountryCode(address.countryCode.value);
        billingAddress.custom.prefix = address.custom.prefix;
        billingAddress.custom.prefixCountry = address.custom.prefixCountry.toUpperCase();
        var phone = address.phone;
        // contcatenate prefix to phone if not already done
        if (phone && phone[0] !== '+') {
            phone = address.prefix + phone;
        }
        billingAddress.setPhone(phone);
    });
}

module.exports = {
    placeOrder: placeOrder,
    createOrder: createOrder,
    sendConfirmationEmail: sendConfirmationEmail,
    copyCustomerAddressToShipment: copyCustomerAddressToShipment,
    copyCustomerAddressToBilling: copyCustomerAddressToBilling,
    copyShippingAddressToShipment: copyShippingAddressToShipment,
    copyBillingAddressToBasket: copyBillingAddressToBasket
};

Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});