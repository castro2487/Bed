"use strict";

var server = require('server');
var OrderMgr = require('dw/order/OrderMgr');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var AdyenHelper = require('*/cartridge/scripts/util/adyenHelper');
var Transaction = require('dw/system/Transaction');
var constants = require('*/cartridge/adyenConstants/constants');

server.extend(module.superModule);

/**
 * Show confirmation after return from Adyen
 */

server.replace('ShowConfirmation', server.middleware.https, function (req, res, next) {
    var Resource = require('dw/web/Resource');

    try {
      var orderToken = req.querystring.orderToken;
      var order = OrderMgr.getOrder(req.querystring.merchantReference, orderToken);
      var paymentInstruments = order.getPaymentInstruments(constants.METHOD_ADYEN_COMPONENT);
      var adyenPaymentInstrument;
      var paymentData;
      var details; // looping through all Adyen payment methods, however, this only can be one.
  
      var instrumentsIter = paymentInstruments.iterator();
  
      while (instrumentsIter.hasNext()) {
        adyenPaymentInstrument = instrumentsIter.next();
        paymentData = adyenPaymentInstrument.custom.adyenPaymentData;
      } // details is either redirectResult or payload
  
  
      if (req.querystring.redirectResult) {
        details = {
          redirectResult: req.querystring.redirectResult
        };
      } else if (req.querystring.payload) {
        details = {
          payload: req.querystring.payload
        };
      } // redirect to payment/details
  
  
      var adyenCheckout = require('*/cartridge/scripts/adyenCheckout');
  
      var requestObject = {
        details: details,
        paymentData: paymentData
      };
      var result = adyenCheckout.doPaymentDetailsCall(requestObject);
      clearAdyenData(adyenPaymentInstrument);

      if (result.invalidRequest) {
        Logger.getLogger('Adyen').error('Invalid /payments/details call');
        return response.redirect(URLUtils.httpHome());
      }

      var merchantRefOrder = OrderMgr.getOrder(result.merchantReference, orderToken);
      var paymentInstrument = merchantRefOrder.getPaymentInstruments(constants.METHOD_ADYEN_COMPONENT)[0]; // Authorised: The payment authorisation was successfully completed.
  
      if (result.resultCode === 'Authorised' || result.resultCode === 'Pending' || result.resultCode === 'Received') {
        if (result.resultCode === 'Received' && result.paymentMethod.indexOf('alipay_hk') > -1) {
          Transaction.wrap(function () {
            OrderMgr.failOrder(merchantRefOrder, true);
          });
          Logger.getLogger('Adyen').error("Did not complete Alipay transaction, result: ".concat(JSON.stringify(result)));
          res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)));
          return next();
        } // custom fraudDetection
  
  
        var fraudDetectionStatus = {
          status: 'success'
        }; // Places the order
  
        var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
  
        if (placeOrderResult.error) {
          Transaction.wrap(function () {
            OrderMgr.failOrder(order, true);
          });
          res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'placeOrder', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)));
          return next();
        }
  
        COHelpers.sendConfirmationEmail(order, req.locale.id); // Reset usingMultiShip after successful Order placement
  
        var OrderModel = require('*/cartridge/models/order');
  
        var Locale = require('dw/util/Locale');
  
        var currentLocale = Locale.getLocale(req.locale.id);
        var orderModel = new OrderModel(merchantRefOrder, {
          countryCode: currentLocale.country
        }); // Save orderModel to custom object during session
  
        Transaction.wrap(function () {
          order.custom.Adyen_CustomerEmail = JSON.stringify(orderModel);
          AdyenHelper.savePaymentDetails(paymentInstrument, merchantRefOrder, result);
        });
        clearForms();
        res.redirect(URLUtils.url('Order-Confirm', 'ID', order.orderNo, 'token', order.orderToken).toString());
        return next();
      }
  
      Transaction.wrap(function () {
        OrderMgr.failOrder(merchantRefOrder, true);
      });
      res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'placeOrder', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)));
      return next();
    } catch (e) {
      Logger.getLogger('Adyen').error("Could not verify /payment/details: ".concat(e.message));
      res.redirect(URLUtils.url('Error-ErrorCode', 'err', 'general'));
      return next();
    }
  });


/**
 * Update viewdata with the allowed payment methods based on site preference
 */
server.append('GetPaymentMethods', server.middleware.https, function (req, res, next) {
  var Resource = require('dw/web/Resource');

  var viewData = res.getViewData();
  var paymentMethods = viewData.AdyenPaymentMethods.paymentMethods;
  var descriptions = viewData.AdyenDescriptions;
  var filteredPaymentMethods = [];
  var filteredDescriptions = [];

  for(var i = 0; i < paymentMethods.length; i++) {    
    if(isMethodTypeAllowed(paymentMethods[i].type)) {
      if (paymentMethods[i].name === 'Credit Card') {
        paymentMethods[i].name = Resource.msg('payment.method.creditcard.title', 'checkout', null);
      }
      filteredPaymentMethods.push(paymentMethods[i]);
      filteredDescriptions.push(descriptions[i]);
    }
  }

  viewData.AdyenPaymentMethods.paymentMethods = filteredPaymentMethods;
  viewData.AdyenDescriptions = filteredDescriptions;
  res.setViewData(viewData);

  return next();
});

server.prepend('PaymentFromComponent', server.middleware.https, function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var currentBasket = BasketMgr.getCurrentBasket();

  if (currentBasket) {
    Transaction.wrap(function () {
      currentBasket.custom.newsLetterRegistration = currentBasket.customer.profile && currentBasket.customer.profile.custom.hasOwnProperty('newsLetterRegistration') ? currentBasket.customer.profile.custom.newsLetterRegistration : false;
      currentBasket.custom.termsAndConditions = true;
    });
  }

  return next();
});

/**
 * Check if the payment method type is allowed
 * @param {String} methodType 
 */
function isMethodTypeAllowed(methodType) {
  var Site = require('dw/system/Site');
  var allowedPaymentMethods = Site.getCurrent().getCustomPreferenceValue('allowedPaymentMethods');

  return allowedPaymentMethods.indexOf(methodType) >= 0 ? true : false;
}
  
/**
 * Clear system session data
 */
function clearForms() {
    // Clears all forms used in the checkout process.
    session.forms.billing.clearFormElement();
    clearCustomSessionFields();
  }

  function clearAdyenData(paymentInstrument) {
    Transaction.wrap(function () {
      paymentInstrument.custom.adyenPaymentData = null;
      paymentInstrument.custom.adyenMD = null;
    });
  }

  /**
   * Clear custom session data
   */  
  function clearCustomSessionFields() {
    // Clears all fields used in the 3d secure payment.
    session.privacy.paymentMethod = null;
    session.privacy.orderNo = null;
    session.privacy.brandCode = null;
    session.privacy.issuer = null;
    session.privacy.adyenPaymentMethod = null;
    session.privacy.adyenIssuerName = null;
    session.privacy.ratePayFingerprint = null;
  }
  
  module.exports = server.exports();