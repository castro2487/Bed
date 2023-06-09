'use strict';

var server = require('server');

server.extend(module.superModule);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.prepend('PlaceOrder', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var currentBasket = BasketMgr.getCurrentBasket();
    var shippingForm = server.forms.getForm('shipping');
    var isTermsAndConditions = (req.form.isTermsAndConditions && req.form.isTermsAndConditions === 'true') ? true : false;

    if(!isTermsAndConditions) {
        res.json({
            error: true
        });
        this.emit('route:Complete', req, res);
        return;
    }

    Transaction.wrap(function () {
        currentBasket.custom.newsLetterRegistration = shippingForm.shippingAddress.newsLetterRegistration.checked;
        currentBasket.custom.termsAndConditions = isTermsAndConditions;
    });

    next();
});

// save prefix and full phone number
server.prepend('SubmitPayment', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    
    var billingAddress = currentBasket.billingAddress;

    var paymentForm = server.forms.getForm('billing');

    if (paymentForm.contactInfoFields.valid) {
    // ensures the full phone number (prefix + phone) is used when executing code in base cartridge
        paymentForm.contactInfoFields.phone.value = paymentForm.contactInfoFields.prefix.value + paymentForm.contactInfoFields.phone.value;
        var Transaction = require('dw/system/Transaction');
        Transaction.wrap(function () {
            billingAddress.setPhone(paymentForm.contactInfoFields.phone.value);
            billingAddress.custom.prefix = paymentForm.contactInfoFields.prefix.value;
            billingAddress.custom.prefixCountry = paymentForm.contactInfoFields.prefixCountry.value;
        });
    }

    return next();
});

// Update estimatedArrivalTime in viewdata
server.append('SubmitPayment', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');

    var currentLocale = Locale.getLocale(req.locale.id);

    var viewData = res.getViewData();
    viewData.customer = new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country);
    viewData.order = new OrderModel(currentBasket, { usingMultiShipping: false, countryCode: currentLocale.country, containerView: 'basket' });

    res.setViewData(viewData);

    this.on('route:BeforeComplete', function (req, res) {
        var thisViewData = res.getViewData(); // eslint-disable-line vars-on-top
        if(!thisViewData.error) {
            thisViewData.order.shipping[0].selectedShippingMethod.estimatedArrivalTime = currentBasket.shipments[0].custom.estimatedArrivalTime;
            res.setViewData(thisViewData);
        }

    });
    
    return next();
});

server.append('Get', server.middleware.https, function (req, res, next) {
    var AccountModel = require('*/cartridge/models/account');
    var Locale = require('dw/util/Locale');

    var currentLocale = Locale.getLocale(req.locale.id);

    var viewData = res.getViewData();
    viewData.customer = new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country);
    res.setViewData(viewData);

    return next();
});

module.exports = server.exports();
