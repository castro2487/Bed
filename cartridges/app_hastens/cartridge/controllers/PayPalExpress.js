/* global empty, session */
'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var OrderModel = require('*/cartridge/models/order');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var PaypalExpressHelper = require('*/cartridge/scripts/helpers/paypalExpressHelper');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var OrderMgr = require('dw/order/OrderMgr');
var AdyenHelper = require('*/cartridge/scripts/util/adyenHelper');
var Logger = require('dw/system/Logger');

server.post('Submit', function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var paypalRequestData = { isPayPalError: false };

    if (currentBasket) {
        Transaction.wrap(function () {
            if (currentBasket.currencyCode !== req.session.currency.currencyCode) {
                currentBasket.updateCurrency();
            }
            cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        var Locale = require('dw/util/Locale');
        var currentLocale = Locale.getLocale(res.viewData.locale);
        // Create a request payload to Adyen
        paypalRequestData = PaypalExpressHelper.createPayPalRequest(currentBasket, currentLocale);
    }

    if (paypalRequestData.isPayPalError) {
        res.redirect(URLUtils.url('Cart-Show', 'paypalError', 'request.creation'));
        return next();
    }

    res.render('checkout/redirect_toPayPal', {
        paypal: paypalRequestData
    });

    return next();
});

function placeOrder (currentBasket, paymentToken, currentCustomer, locale) {
    try {
        var PaymentMgr = require('dw/order/PaymentMgr');
        var paymentProcessor = PaymentMgr.getPaymentMethod('AdyenComponent').paymentProcessor;

        Transaction.wrap(function () {
            currentBasket.custom.newsLetterRegistration = currentBasket.customer.profile && currentBasket.customer.profile.custom.hasOwnProperty('newsLetterRegistration') ? currentBasket.customer.profile.custom.newsLetterRegistration : false;
            currentBasket.custom.termsAndConditions = true;
            currentBasket.paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
        });

        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var order = COHelpers.createOrder(currentBasket);
        if (!order) {
            return { error: true };
        }

        var paypalAuthorizePayment = require('*/cartridge/scripts/paypalAuthorizePayment');
        var result = paypalAuthorizePayment.execute(order.orderNo, currentBasket.paymentInstrument, paymentProcessor, paymentToken);

        if (result.msg === 'Authorised' || result.msg === 'Pending' || result.msg === 'Received') {
            var fraudDetectionStatus = {
                status: 'success'
            };

            var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
            if (placeOrderResult.error) {
                Transaction.wrap(function () {
                    OrderMgr.failOrder(order, true);
                });
                return { error: true };
            }
            
            if (order.getCustomerEmail()) {
                COHelpers.sendConfirmationEmail(order, locale.id);
            }

            var Locale = require('dw/util/Locale');

            var currentLocale = Locale.getLocale(locale.id);
            var orderModel = new OrderModel(order, {
                countryCode: currentLocale.country
            });
            
            // Save orderModel to custom object during session
            Transaction.wrap(function () {
                order.custom.Adyen_CustomerEmail = JSON.stringify(orderModel);
            });
            return {
                error: false,
                orderNo: order.orderNo,
                orderToken: order.orderToken
            };
        }
        return { error: true };
    } catch (e) {
        Logger.getLogger('Adyen').error("Could not verify /payment/details: ".concat(e.toString(), " in ").concat(e.fileName, ":").concat(e.lineNumber));
        return { error: true };
    }
}

server.post('Confirm', function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();

    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(res.viewData.locale);
    var paypalObject = PaypalExpressHelper.validatePayPalResponse(req, currentLocale);

    var urlRedirect;
    if (paypalObject.returnToCart) {
        if (paypalObject.missingData) {
            urlRedirect = URLUtils.url('Cart-Show', 'paypalError', 'missing.data');
        } else if (!paypalObject.validCountry) {
            urlRedirect = URLUtils.url('Cart-Show', 'paypalError', 'invalid.country');
        } else {
            urlRedirect = URLUtils.url('Cart-Show', 'paypalError', 'generic.error');
        }
        res.redirect(urlRedirect);
    } else {
        // split token because exceeds the maximum string length
        session.custom.paymentToken1 = paypalObject.paymentToken.substr(0, 1000);
        session.custom.paymentToken2 = paypalObject.paymentToken.substr(1000);        
        if (req.currentCustomer.profile) {
            // redirect to checkout-summary to accept terms and conditions
            res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'placeOrder', 'disableEditButtons', true));
        } else {
            // redirect to checkout-shipping to enable guest user filling telephone fields
            res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'shipping', 'missingTelephone', true));
        }
    }
    return next();
});

server.post('PlaceOrder', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();

    if (currentBasket && req.form.prefix && req.form.prefixCountry && req.form.phone) {
        var Transaction = require('dw/system/Transaction');
        Transaction.wrap(function () {
            var shippingAddress = currentBasket.defaultShipment.shippingAddress;
            shippingAddress.setPhone(req.form.prefix + req.form.phone);
            shippingAddress.custom.prefix = req.form.prefix;
            shippingAddress.custom.prefixCountry = req.form.prefixCountry;

            var billingAddress = currentBasket.billingAddress;
            billingAddress.setPhone(req.form.prefix + req.form.phone);
            billingAddress.custom.prefix = req.form.prefix;
            billingAddress.custom.prefixCountry = req.form.prefixCountry;
        });

        res.json({
            success: true,
            redirectUrl: URLUtils.url('Checkout-Begin', 'stage', 'placeOrder', 'disableEditButtons', true).toString()
        });
    } else {
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show', 'paypalError', 'order.placement').toString()
        });
    }
    next();
});

server.post('ShowConfirmationPayment', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();

    var result = placeOrder(currentBasket, session.custom.paymentToken1 + session.custom.paymentToken2, req.currentCustomer, req.locale);
    if (result.error) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show', 'paypalError', 'order.placement').toString()
        });
    } else {
        res.json({
            error: false,
            orderID: result.orderNo,
            orderToken: result.orderToken,
            continueUrl: URLUtils.url('Order-Confirm').toString()
        });
    }

    next();
});

module.exports = server.exports();