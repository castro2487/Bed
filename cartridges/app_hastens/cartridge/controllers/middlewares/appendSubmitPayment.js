'use strict';

function appendSubmitPayment(req, res, next) {
    // app_hastens
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');

    var currentLocale = Locale.getLocale(req.locale.id);

    var viewData = res.getViewData();
    viewData.customer = new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country);
    viewData.order = new OrderModel(currentBasket, { usingMultiShipping: false, countryCode: currentLocale.country, containerView: 'basket' });

    viewData.order.shipping[0].selectedShippingMethod.estimatedArrivalTime = currentBasket.shipments[0].custom.estimatedArrivalTime;

    res.setViewData(viewData);
 
    var selectedPaymentMethod = currentBasket.paymentInstrument.paymentMethod;
    if (selectedPaymentMethod === 'AdyenComponent') {
        selectedPaymentMethod = req.form.brandCode;
    }

    var Site = require('dw/system/Site');
    var summaryLessPaymentMethods = Site.getCurrent().getCustomPreferenceValue('summaryLessPaymentMethods');
    var skipSummary = summaryLessPaymentMethods && summaryLessPaymentMethods.indexOf(selectedPaymentMethod) > -1;

    if (skipSummary) {
        return next();
    } else {
        this.emit('route:Complete', req, res);
    }
}

module.exports = appendSubmitPayment;
