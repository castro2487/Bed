/* global empty, session, request, response, dw, Mac, customer */
'use strict';
var Mac = require('dw/crypto/Mac');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');
var Encoding = require('dw/crypto/Encoding');
var BasketMgr = require('dw/order/BasketMgr');
var ShippingMgr = require('dw/order/ShippingMgr');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var Logger = require('dw/system/Logger').getLogger('PayPalExpress');
var AdyenHelper = require('int_adyen_overlay/cartridge/scripts/util/adyenHelper');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var ADDRESS_TYPE = {
    SHIPPING: 'shipping',
    BILLING: 'billing'
};
var RESULT_CODE = {
    REFUSED: 'Refused',
    ERROR: 'Error',
    CANCELLED: 'Cancelled',
    AUTHORISED: 'Authorised',
    AUTHORISATION: 'AUTHORISATION'
};

/**
 * Get user IP.
 * @returns {string} User IP address
 */
function getUserIP() {
    var userIP = null;

    if (!empty(request.httpHeaders['true-client-ip'])) {
        userIP = request.httpHeaders['true-client-ip'];
    } else if (!empty(request.httpHeaders.HTTP_X_FORWARDED_FOR)) {
        userIP = request.httpHeaders.HTTP_X_FORWARDED_FOR;
    } else {
        userIP = request.getHttpRemoteAddress();
    }

    return userIP;
}

/**
 * Check if address empty or not
 * @param {string} addressType Billing/Shipping
 * @param {dw.order.Order} order Created order
 * @returns {boolean} - True if has empty shipping/billing address, false otherwise
 */
function iHasEmptyAddress(addressType, order) {
    var hasEmptyAddress = false;
    var msg = null;

    if (addressType === ADDRESS_TYPE.SHIPPING && empty(order.defaultShipment.shippingAddress)) {
        msg = 'No shipping address when creating shipping address for payment provider. Order number: ' + order.orderNo;
    } else if (addressType === ADDRESS_TYPE.BILLING && empty(order.billingAddress)) {
        msg = 'Billing address is empty for order : ' + order.orderNo;
    }

    if (!empty(msg)) {
        Logger.error(msg);
        hasEmptyAddress = true;
    }
    return hasEmptyAddress;
}

/**
 * Get order address by type
 * @param {string} type Billing/Shipping
 * @param {dw.order.Order} order Created order
 * @returns {Object} Address
 * @inner
 */
function iGetAddressByType(type, order) {
    var orderAddress = null;
    if (type === ADDRESS_TYPE.SHIPPING) {
        orderAddress = order.defaultShipment.shippingAddress;
    } else if (type === ADDRESS_TYPE.BILLING) {
        orderAddress = order.billingAddress;
    }

    return orderAddress;
}

/**
* Get the house no. and merged address from Address1 and Address2.
* @param {Object} address - current address
* @returns {Object} Address info
*/
function iGetAddressInfo(address) {
    var addressInfo = {
        mergedAddress: address.address1,
        housenr: '0'
    };

    // Address1 and address2 will be merged into one variable
    var splittedAddress = !empty(addressInfo.mergedAddress) ? addressInfo.mergedAddress.split(' ') : [];

    if (splittedAddress.length > 1) {
        var regex = new RegExp('^[0-9].{0,12}');
        var len = splittedAddress.length;
        var part = null;

        while (len--) {
            part = splittedAddress[len];
            if (regex.test(part)) {
                // Get the housenr and remove from the address
                addressInfo.housenr = part;
                addressInfo.mergedAddress = dw.util.StringUtils.trim(addressInfo.mergedAddress.replace(part, ''));
                break;
            }
        }
    }

    if (!empty(address.address2)) {
        addressInfo.mergedAddress += address.address2;
    }

    return addressInfo;
}

/**
 * Get address set into the Order.
 * @param {dw.order.Order} order Created order
 * @param {string} addressType Shipping / billing address to get from order
 * @returns {Object} Address set into the order
 */
function getAddress(order, addressType) {
    var deliveryAddress = {};

    if (!iHasEmptyAddress(addressType, order)) {
        var address = iGetAddressByType(addressType, order);
        var addressInfo = iGetAddressInfo(address);

        deliveryAddress.street = addressInfo.mergedAddress;
        deliveryAddress.city = address.city;
        deliveryAddress.houseNumberOrName = addressInfo.housenr;
        deliveryAddress.state = address.stateCode;
        deliveryAddress.stateOrProvince = address.stateCode;
        deliveryAddress.postalCode = address.postalCode;
        deliveryAddress.country = address.countryCode.value;
    }

    return deliveryAddress;
}

/**
 * Calculates the amount to be payed by a non-gift certificate payment instrument based
 * on the given basket. The method subtracts the amount of all redeemed gift certificates
 * from the order total and returns this value.
 *
 * @param {dw.order.LineItemCtnr} lineItemCtnr - LineIteam Container (Basket or Order)
 * @returns {dw.value.Money} non gift certificate amount
 */
function calculateNonGiftCertificateAmount(lineItemCtnr) {
    var giftCertTotal = new dw.value.Money(0.0, lineItemCtnr.currencyCode);
    var gcPaymentInstrs = lineItemCtnr.getGiftCertificatePaymentInstruments();
    var iter = gcPaymentInstrs.iterator();
    var orderPI = null;

    while (iter.hasNext()) {
        orderPI = iter.next();
        giftCertTotal = giftCertTotal.add(orderPI.getPaymentTransaction().getAmount());
    }
    var orderTotal = lineItemCtnr.totalGrossPrice;
    var amountOpen = orderTotal.subtract(giftCertTotal);

    return amountOpen;
}

/**
 * Delete all payment instruments from Basket
 * @param {dw.order.LineItemCtnr} basket - Basket
 */
function removeAllPaymentInstruments(basket) {
    var collections = require('*/cartridge/scripts/util/collections');
    Transaction.wrap(function () {
        collections.forEach(basket.getPaymentInstruments(), function (item) {
            basket.removePaymentInstrument(item);
        });
    });
}

/**
 * Generate parameters that needed for the redirect to Adyen Hosted Payment Page.
 * @param {dw.order.Basket} basket - current basket
 * @param {Object} locale - current site locale
 * @returns {Object} - send this data Objecgt to Adyen Hosted Payment Page.
 */
function createPayPalRequest(basket, locale) {
    var dataObject = { isPayPalError: false };
    try {
        var mode = Site.getCurrent().getCustomPreferenceValue('Adyen_Mode');
        var debug = Site.getCurrent().getCustomPreferenceValue('Adyen_Debug');
        var paypalHMACkey = Site.getCurrent().getCustomPreferenceValue('Adyen_SkinHMACKey');
        var paypalSkinCode = Site.getCurrent().getCustomPreferenceValue('Adyen_SkinCode');
        var merchantAccount = Site.getCurrent().getCustomPreferenceValue('Adyen_merchantCode');
        var keys = '';
        var values = '';
        var shopperEmail = '';
        var shopperReference = '';
        var methodName = 'paypal_ecs';
        var countryCode = locale.country;
        var merchantReference = basket.UUID;
        var inputType = debug ? 'text' : 'hidden';
        var currencyCode = basket.getCurrencyCode();

        if (paypalSkinCode === null || paypalHMACkey === null) {
            throw new Error('PayPal skin code or HMACKey is not set on Adyen Site Preference');
        }

        // Remove existing Payment method
        removeAllPaymentInstruments(basket);

        var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
        var netTaxation = avataxSettings && avataxSettings.taxCalculation;

        var myAmount = AdyenHelper.getCurrencyValueForApi(netTaxation ? basket.totalNetPrice : basket.totalGrossPrice);
        var amount = myAmount.getValue();
        if (customer.authenticated) {
            shopperReference = customer.ID;
            shopperEmail = customer.profile.email;
        }

        var sessionValidity = new Date();
        var shipBeforeDate = new Date();
        var adyenRequest = new dw.util.SortedMap();
        shipBeforeDate.setDate(shipBeforeDate.getDate() + 5);
        sessionValidity.setHours(sessionValidity.getHours() + 1);

        adyenRequest.put('merchantReference', merchantReference); //
        adyenRequest.put('paymentAmount', amount.toString()); //
        adyenRequest.put('currencyCode', currencyCode);
        adyenRequest.put('shipBeforeDate', shipBeforeDate.toISOString());
        adyenRequest.put('skinCode', paypalSkinCode);
        adyenRequest.put('merchantAccount', merchantAccount);
        adyenRequest.put('sessionValidity', sessionValidity.toISOString());

        if (customer.authenticated) {
            adyenRequest.put('shopperEmail', shopperEmail);
        }

        adyenRequest.put('resURL', URLUtils.https('PayPalExpress-Confirm'));
        adyenRequest.put('countryCode', countryCode);
        adyenRequest.put('brandCode', methodName);
        adyenRequest.put('shopperReference', shopperReference);

        for (var key in adyenRequest) { // eslint-disable-line
            if (Object.prototype.hasOwnProperty.call(adyenRequest, key)) {
                keys = keys.concat(key + ':');
                var value = adyenRequest[key];
                value = value.toString().replace(/\\/g, '\\\\').replace(/\:/g, '\\:'); // eslint-disable-line
                values = values.concat(value + ':');
            }
        }

        values = values.substring(0, values.length - 1);
        var requestString = keys.concat(values);
        
        var keyBytes = Encoding.fromHex(paypalHMACkey);
        var hashkey = Mac(Mac.HMAC_SHA_256); // eslint-disable-line
        var merchantSig = Encoding.toBase64(hashkey.digest(requestString, keyBytes));
        adyenRequest.put('merchantSig', merchantSig);

        dataObject.mode = mode;
        dataObject.debug = debug;
        dataObject.inputType = inputType;
        dataObject.paramsMap = adyenRequest;
    } catch (error) {
        Logger.error('Something went wrong with PayPal Express' + JSON.stringify(error));
        dataObject.isPayPalError = true;
        dataObject.isPayPalErrorMsg = JSON.stringify(error);
    }
    return dataObject;
}

/**
 * Breakdown the PayPal address data into address1 and address2
 * @param {string} address this is the complete address from shipping and billing from paypal
 * @param {boolean} isAddress1 true or false
 * @return {string} resultAddress
 */
function splitAddressFromPayPal(address, isAddress1) {
    var splitAddress;
    var resultAddress;
    if (address.indexOf('\r\n') > 0) {
        splitAddress = address.split('\r\n');
        resultAddress = (isAddress1 ? splitAddress[0] : splitAddress[1]);
    } else {
        resultAddress = isAddress1 ? address : '';
    }
    return resultAddress;
}

function calculateEstimatedArrivalDate(currentBasket, currentCountry) {
    var OrderModel = require('*/cartridge/models/order');
    var zenkraft = require('*/cartridge/scripts/zenkraft'); // eslint-disable-line vars-on-top
    var zenkraftHelper = require('*/cartridge/scripts/helpers/zenkraftHelper'); // eslint-disable-line vars-on-top, max-len
    
    var basketModel = new OrderModel(
        currentBasket,
        {
            usingMultiShipping: false,
            shippable: true,
            countryCode: currentCountry,
            containerView: 'basket'
        }
    );

    var thisAddress = basketModel.shipping[0].shippingAddress; // eslint-disable-line vars-on-top, max-len
    var thisMethods = basketModel.shipping[0].applicableShippingMethods; // eslint-disable-line vars-on-top, max-len
    var thisItems = basketModel.items; // eslint-disable-line vars-on-top
    var thisDates = []; // eslint-disable-line vars-on-top
    var thisMethWithDates = []; // eslint-disable-line vars-on-top

    thisDates = zenkraft.getShippingData(thisAddress, thisItems, thisMethods);

    // if we get dates back
    if (!empty(thisDates)) { // eslint-disable-line no-undef
        thisMethods.forEach(function filterMethods(method) {
            var thisMethod = zenkraftHelper.filterShippingMethodsForEstimatedDate(method, thisDates);
            thisMethWithDates.push(thisMethod);

            if(thisMethod.selected) {
                basketModel.shipping[0].selectedShippingMethod = thisMethod;
            }
        });

        basketModel.shipping[0].applicableShippingMethods = thisMethWithDates;
    }

    // save the selected shipping method arrival time on Basket's Shipment
    Transaction.wrap(function () {
        currentBasket.shipments[0].custom.estimatedArrivalTime = basketModel.shipping[0].selectedShippingMethod.estimatedArrivalTime;
    });
}

/**
 * Handle Shipping and Billing Address.
 * @param {Object} parameterMap - httpParam data object from PayPal Response
 * @returns {Object} result
 */
function createShippingAndBilling(parameterMap, currentCountry) {
    var basket = BasketMgr.getCurrentBasket();
    var result = { isPayPalError: false };
    var email = parameterMap.get('shopperEmail').getStringValue();
    var firstName = parameterMap.get('shopper.firstName').getStringValue();
    var lastName = parameterMap.get('shopper.lastName').getStringValue();
    var phoneNumber = '';
    var prefix;
    var prefixCountry;
    var paymentMethod = parameterMap.get('paymentMethod').getStringValue();
    var payerid = parameterMap.get('payment.payerid').getStringValue();
    var paymentToken = parameterMap.get('payment.token').getStringValue();
    var merchantReference = parameterMap.get('merchantReference').getStringValue();

    // Shipping Details from PayPal
    var completeShippingAddress = parameterMap.get('deliveryAddress.street').getStringValue();
    var completeBillingAddress = parameterMap.get('billingAddress.street').getStringValue();

    if (empty(completeShippingAddress) || empty(completeBillingAddress)) {
        result.isPayPalError = true;
    } else {
        // Shipping Details from PayPal
        var shippingCity = parameterMap.get('deliveryAddress.city').getStringValue();
        var shippingPostalCode = parameterMap.get('deliveryAddress.postalCode').getStringValue();
        var shippingCountryCode = parameterMap.get('deliveryAddress.country').getStringValue();
        var shippingStateCode = parameterMap.get('deliveryAddress.state').getStringValue();

        // Billing Details from PayPal
        var billingCity = parameterMap.get('billingAddress.city').getStringValue();
        var billingPostalCode = parameterMap.get('billingAddress.postalCode').getStringValue();
        var billingCountryCode = parameterMap.get('billingAddress.country').getStringValue();
        var billingStateCode = parameterMap.get('billingAddress.state').getStringValue();

        Transaction.wrap(function () {
            // Set Customer Email Address
            var customer = basket.customer;
            if (customer && customer.authenticated) {
                basket.setCustomerEmail(customer.getProfile().getEmail());
                phoneNumber = customer.profile.phoneHome;
                prefix = customer.profile.custom.prefix;
                prefixCountry = customer.profile.custom.prefixCountry;
            } else {
                basket.setCustomerEmail(email);
            }

            if (!prefix || !prefixCountry) {
                var prefixes = require('*/cartridge/config/prefixes');
                prefix = prefixes[currentCountry];
                prefixCountry = currentCountry.toLowerCase();                
            }

            // Create Shipping Address based on PayPal response
            var shippingAddress = basket.getDefaultShipment().createShippingAddress();
            shippingAddress.setFirstName(firstName);
            shippingAddress.setLastName(lastName);
            shippingAddress.setAddress1(splitAddressFromPayPal(completeShippingAddress, true));
            shippingAddress.setAddress2(splitAddressFromPayPal(completeShippingAddress, false));
            shippingAddress.setCity(shippingCity);
            shippingAddress.setPhone(phoneNumber);
            shippingAddress.custom.prefix = prefix;
            shippingAddress.custom.prefixCountry = prefixCountry;
            shippingAddress.setPostalCode(shippingPostalCode);
            shippingAddress.setCountryCode(shippingCountryCode);
            shippingAddress.setStateCode(shippingStateCode);

            // Create Billing Address copying Shipping Address
            var billingAddress = basket.createBillingAddress();
            billingAddress.setFirstName(firstName);
            billingAddress.setLastName(lastName);
            billingAddress.setAddress1(splitAddressFromPayPal(completeShippingAddress, true));
            billingAddress.setAddress2(splitAddressFromPayPal(completeShippingAddress, false));
            billingAddress.setCity(shippingCity);
            billingAddress.setPhone(phoneNumber);
            billingAddress.custom.prefix = prefix;
            billingAddress.custom.prefixCountry = prefixCountry;
            billingAddress.setPostalCode(shippingPostalCode);
            billingAddress.setCountryCode(shippingCountryCode);
            billingAddress.setStateCode(shippingStateCode);

            // Sets the shipping method of the basket's default shipment
            var shippingMethodID = basket.getDefaultShipment().shippingMethodID;

            // Calculate and Update total of the basket
            cartHelper.ensureAllShipmentsHaveMethods(basket);
            basketCalculationHelpers.calculateTotals(basket);

            // calculate the amount to be charged
            var amount = calculateNonGiftCertificateAmount(basket);

            // Remove existing Payment method
            removeAllPaymentInstruments(basket);

            // create a payment instrument for this payment method
            var paymentInstr = basket.createPaymentInstrument(paymentMethod, amount);

            calculateEstimatedArrivalDate(basket, currentCountry);

            result = {
                basket: basket,
                shippingMethodID: shippingMethodID
            };
        });
    }
    return result;
}

/**
 * validate both Shipping and Billing data from paypal express
 * @param {Object} data - current data from paypal express
 * @returns {Object} return final result
 */
function validatePaypalExpressData(data) {
    var result = {
        missingData: false
    };
    var excludeFieldsFromValidation = [
        'authResult',
        'merchantReference',
        'merchantSig',
        'parameterCount',
        'parameterNames',
        'payment.payerid',
        'payment.token',
        'paymentMethod',
        'pspReference',
        'requestBodyAsString',
        'shopperLocale',
        'skinCode'
    ];

    data.parameterNames.toArray().forEach(function (param) {
        data.get(param).values.toArray().forEach(function (v) {
            var normalRegEx = new RegExp(/\w+/gm);
            if (!(excludeFieldsFromValidation.indexOf(param) > -1)) {
                var regResult = normalRegEx.test(v);
                if (!regResult) {
                    result.missingData = true;
                    Logger.error('PayPal Express data are missing: ' + param + ' value: ' + v);
                }
            }
        });
    });

    return result;
}

/**
 * Validate Response from Adyen Hosted Payment Page.
 * @param {Object} req - current request
 * @param {dw.util.Locale} locale - current locale
 * @returns {Object} - result.
 */
function validatePayPalResponse(req, locale) {
    var paypalObject = { returnToCart: false };
    try {
        var parameterMap = request.getHttpParameterMap();
        var authResult = parameterMap.authResult.stringValue;
        var shippingCountryCode = parameterMap.get('deliveryAddress.country').getStringValue();
        var validationResult = validatePaypalExpressData(parameterMap);

        var validCountry = locale.country === shippingCountryCode;
        if (authResult !== 'PENDING') {
            paypalObject.returnToCart = true;
            paypalObject.validCountry = true;
        } else if (validationResult.missingData) {
            paypalObject = {
                missingData: true,
                returnToCart: true
            };
        } else {
            var result = createShippingAndBilling(parameterMap, locale.country);
            if (!result.isPayPalError && validCountry) {
                paypalObject.basket = result.basket;
                paypalObject.returnToCart = false;
            } else {
                paypalObject.returnToCart = true;
                paypalObject.validCountry = validCountry;
            }
            paypalObject.paymentToken = parameterMap.get('payment.token').getStringValue();
        }
    } catch (error) {
        Logger.error('Something went wrong with PayPal Express' + JSON.stringify(error));
        paypalObject.returnToCart = true;
        paypalObject.validCountry = true;
    }
    return paypalObject;
}

module.exports = {
    createPayPalRequest: createPayPalRequest,
    validatePayPalResponse: validatePayPalResponse,
    getAddress: getAddress,
    ADDRESS_TYPE: ADDRESS_TYPE,
    RESULT_CODE: RESULT_CODE,
    getUserIP: getUserIP
};
