/* global empty, session, request, response, dw, Mac, customer */
'use strict';
var Site = require('dw/system/Site');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('Authorize-PayPalExpress', 'PayPalExpress');
var PaypalExpressHelper = require('*/cartridge/scripts/helpers/paypalExpressHelper');
var merchantAccount = Site.getCurrent().getCustomPreferenceValue('Adyen_merchantCode');
var AdyenHelper = require('int_adyen_overlay/cartridge/scripts/util/adyenHelper');

/**
 * Create a request payload to authorize paypal Express
 * @param {Object} order - Order Number
 * @param {dw.order.PaymentInstrument} paymentDetails - Current Payment of customer
 * @returns {Object} paymentRequest
 */
function createPayLoad(order, paymentDetails, paymentToken) {
    var paymentAmount = AdyenHelper.getCurrencyValueForApi(paymentDetails.paymentTransaction.amount);
    var shippingAddress = order.getDefaultShipment().getShippingAddress();
    var amount = {
        value: paymentAmount.getValue().toString(),
        currency: order.currencyCode
    };
    var additionalData = {
        'payment.token': paymentToken
    };
    var browserInfo = {
        acceptHeader: request.httpHeaders.accept,
        userAgent: request.httpUserAgent
    };
    var shopperName = {
        firstName: shippingAddress.firstName,
        gender: 'UNKNOWN',
        infix: '',
        lastName: shippingAddress.lastName
    };

    var paymentRequest = {
        amount: amount,
        reference: order.orderNo,
        browserInfo: browserInfo,
        shopperName: shopperName,
        additionalData: additionalData,
        merchantAccount: merchantAccount,
        shopperIP: PaypalExpressHelper.getUserIP(),
        selectedBrand: paymentDetails.paymentMethod,
        billingAddress: PaypalExpressHelper.getAddress(order, PaypalExpressHelper.ADDRESS_TYPE.BILLING),
        deliveryAddress: PaypalExpressHelper.getAddress(order, PaypalExpressHelper.ADDRESS_TYPE.SHIPPING),

    };
    Logger.info('Request:' + JSON.stringify(paymentRequest));
    return JSON.stringify(paymentRequest);
}

/**
 * Authorize PayPal Express Payment
 * @param {string} orderNo - Order Number
 * @param {dw.order.PaymentInstrument} paymentInstrument - Current Payment of customer
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 * @returns {Object} return response from adyen
 */
function execute(orderNo, paymentInstrument, paymentProcessor, paymentToken) {
    var AdyenHelper = require('*/cartridge/scripts/util/adyenHelper');

    var result = { authorized: false, error: true, msg: null };
    var service = LocalServiceRegistry.createService('adyen.http.payment.authorize.send', {
        createRequest: function (svc, order, payment, paymentToken) {
            var apiKey = AdyenHelper.getAdyenApiKey();
            svc.setRequestMethod('POST');
            svc.addHeader('Content-type', 'application/json');
            svc.addHeader('charset', 'UTF-8');
            svc.addHeader('X-API-KEY', apiKey);
            var requestBody = createPayLoad(order, payment, paymentToken);
            return requestBody;
        },
        // Mock function
        mockCall: function (svc, params) { //eslint-disable-line
            var response = {};
            response.statusCode = 200;
            response.statusMessage = 'Success';
            return response;
        },
        // Parse function only called for a status code in the 200s
        parseResponse: function (svc, response) {
            return response;
        },

        filterLogMessage: function (msg) {
            return msg;
        }
    });

    try {
        var order = OrderMgr.getOrder(orderNo);
        var currentPaymentInstrument = paymentInstrument;
        var paymentAmount = AdyenHelper.getCurrencyValueForApi(paymentInstrument.paymentTransaction.amount);
        var response = service.call(order, paymentInstrument, paymentToken);
        var responseObj;

        Transaction.begin();
        currentPaymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;

        if (response.status === 'OK') {
            responseObj = JSON.parse(response.object.text);
            // Set order custom attributes
            order.custom.Adyen_pspReference = responseObj.pspReference;
            order.paymentTransaction.transactionID = responseObj.pspReference;
            currentPaymentInstrument.paymentTransaction.transactionID = responseObj.pspReference;

            if (!empty(responseObj.additionalData) && !empty(responseObj.additionalData.fraudManualReview)) {
                order.custom.Adyen_fraudManualReview = responseObj.additionalData.fraudManualReview;
            }
            if (!empty(responseObj.additionalData) && !empty(responseObj.additionalData.fraudResultType)) {
                order.custom.Adyen_fraudResultType = responseObj.additionalData.fraudResultType;
            }
            currentPaymentInstrument.paymentTransaction.custom.Adyen_log = JSON.stringify(responseObj);

            if (responseObj.resultCode === PaypalExpressHelper.RESULT_CODE.AUTHORISED) {
                result = { authorized: true, error: false, msg: responseObj.resultCode };
            } else {
                result.msg = responseObj.resultCode;
            }
            Logger.info('Response:' + JSON.stringify(responseObj));
        } else {
            result.msg = response.errorMessage;
        }
        Transaction.commit();
    } catch (error) {
        Logger.error('Error while executing Adyen Authorization with PayPal Express' + error.toString());
    }
    return result;
}

module.exports = {
    createPayLoad: createPayLoad,
    execute: execute
};
