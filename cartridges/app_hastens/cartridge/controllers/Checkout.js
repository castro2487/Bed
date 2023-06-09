'use strict';

var server = require('server');

server.extend(module.superModule);

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

// Update shippingAddress to include profile email in viewdata if customer is logged in
server.append('Begin', function (req, res, next) {

    var placeOrderForm = server.forms.getForm('placeOrder');
    placeOrderForm.clear();

    var currentCustomer = req.currentCustomer.raw;
    var viewData = res.getViewData();

    if(currentCustomer.profile) {       
        viewData.order.orderEmail = currentCustomer.profile.email;
    }

    //update selected shipping method in viewdata
    viewData.order.shipping[0].applicableShippingMethods.forEach(function(method) {
        if(method.selected) {
            viewData.order.shipping[0].selectedShippingMethod = method;
        }
    });

    //add placeOrder form in viewdata
    viewData.forms.placeOrderForm = placeOrderForm;

    var BasketMgr = require('dw/order/BasketMgr');
    var collections = require('*/cartridge/scripts/util/collections');
    var Locale = require('dw/util/Locale');

    var currentBasket = BasketMgr.getCurrentBasket();

    var currentCustomer = req.currentCustomer.raw;
    var currentLocale = Locale.getLocale(req.locale.id);

    // filter out addresses of countries different from che current one
    var filteredAddressBook = [];
    var addressBook = currentCustomer.addressBook;
    if (addressBook) {
        for (var i = 0, ii = addressBook.addresses.length; i < ii; i++) {
            if (addressBook.addresses[i].countryCode.value === currentLocale.country) {
                filteredAddressBook.push(addressBook.addresses[i]);
            }
        }
    }

    var Transaction = require('dw/system/Transaction');
    var prefixes = require('*/cartridge/config/prefixes');

    if (filteredAddressBook.length > 0) {
        var preferredAddress;
        if (req.currentCustomer.addressBook.preferredAddress.countryCode.value === currentLocale.country) {
            preferredAddress = req.currentCustomer.addressBook.preferredAddress;
        } else {
            var firstCustomerAddress = filteredAddressBook[0];
            preferredAddress = {
                address1: firstCustomerAddress.address1,
                address2: firstCustomerAddress.address2,
                city: firstCustomerAddress.city,
                companyName: firstCustomerAddress.companyName,
                countryCode: firstCustomerAddress.countryCode,
                firstName: firstCustomerAddress.firstName,
                ID: firstCustomerAddress.ID,
                lastName: firstCustomerAddress.lastName,
                phone: firstCustomerAddress.phone,
                postalCode: firstCustomerAddress.postalCode,
                postBox: firstCustomerAddress.postBox,
                raw: firstCustomerAddress,
                salutation: firstCustomerAddress.salutation,
                secondName: firstCustomerAddress.secondName,
                stateCode: firstCustomerAddress.stateCode,
                suffix: firstCustomerAddress.suffix,
                suite: firstCustomerAddress.suite,
                title: firstCustomerAddress.title
            };
        }

        // initialize existing book addresses with phone prefix associated with current locale
        if (!preferredAddress.raw.custom.prefix || !preferredAddress.raw.custom.prefixCountry) {
            Transaction.wrap(function () {
                preferredAddress.raw.custom.prefix = prefixes[currentLocale.country];
                preferredAddress.raw.custom.prefixCountry = currentLocale.country.toLowerCase();
                preferredAddress.phone = preferredAddress.raw.custom.prefix + preferredAddress.phone;
                preferredAddress.raw.phone = preferredAddress.phone;
            });
        }

        var shipments = currentBasket.shipments;
        collections.forEach(shipments, function (shipment) {
            if (!shipment.shippingAddress || (shipment.shippingAddress.countryCode.value !== currentLocale.country) || !shipment.shippingAddress.custom.prefix) {
                COHelpers.copyCustomerAddressToShipment(preferredAddress, shipment);
            }
        });

        var billingAddress = currentBasket.billingAddress;
        if (!billingAddress || (billingAddress.countryCode.value !== currentLocale.country) || !billingAddress.custom.prefix) {
            COHelpers.copyCustomerAddressToBilling(preferredAddress);
        }

        var shippingForm = COHelpers.prepareShippingForm(currentBasket);
        var billingForm = COHelpers.prepareBillingForm(currentBasket);
        
        // remove prefix from phone
        var prefixLength = preferredAddress.raw.custom.prefix ? preferredAddress.raw.custom.prefix.length : 0;
        preferredAddress.phone = preferredAddress.phone.substr(prefixLength);

        shippingForm.copyFrom(preferredAddress);
        billingForm.copyFrom(preferredAddress);

        viewData.forms.shippingForm = shippingForm;
        viewData.forms.billingForm = billingForm;

    }

    if (currentCustomer.registered && !currentBasket.customerEmail) {
        Transaction.wrap(function () {
            currentBasket.customerEmail = currentCustomer.profile.email;
        });        
    }

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var allValid = COHelpers.ensureValidShipments(currentBasket);

    var OrderModel = require('*/cartridge/models/order');
    var orderModel = new OrderModel(
        currentBasket,
        {
            customer: currentCustomer,
            usingMultiShipping: usingMultiShipping,
            shippable: allValid,
            countryCode: currentLocale.country,
            containerView: 'basket'
        },
        true
    );
    
    var AccountModel = require('*/cartridge/models/account');
    var accountModel = new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country);

    var TaxMgr = require('dw/order/TaxMgr');
    var taxRate = TaxMgr.getTaxRate('Standard', currentLocale.country) * 100;

    // if no prefix stored, initialize with the one associated with the current locale
    var shippingAddress = orderModel.shipping[0].shippingAddress;
    if (shippingAddress && shippingAddress.prefix) {
        viewData.prefixValue = shippingAddress.prefix;
        viewData.prefixCountry = shippingAddress.prefixCountry.toLowerCase();
    } else {
        viewData.prefixValue = prefixes[currentLocale.country];
        viewData.prefixCountry = currentLocale.country.toLowerCase();
    }

    viewData.order = orderModel;
    viewData.customer = accountModel;
    viewData.taxRate = taxRate;
    viewData.currentCountry = currentLocale.country;
    viewData.prefixes = prefixes;
    viewData.countryNames = require('*/cartridge/config/countryNames');

    var URLUtils = require('dw/web/URLUtils');

    viewData.urls = {
        termsAndConditions: URLUtils.url('Search-Show', 'cgid', 'terms-of-use'),
        privacyPolicy: URLUtils.url('Search-Show', 'cgid', 'privacy-policy')
    };

    var Site = require('dw/system/Site');
    var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
    viewData.netTaxation = avataxSettings && avataxSettings.taxCalculation;
    viewData.avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

    var querystring = req.querystring.toString();
    viewData.inputDisabled = querystring.indexOf('missingTelephone=true') > -1;

    var summaryLessPaymentMethods = Site.getCurrent().getCustomPreferenceValue('summaryLessPaymentMethods');
    var summaryLessPaymentMethodsValues = [];

    if (summaryLessPaymentMethods) {
        Object.keys(summaryLessPaymentMethods).forEach( function (key) {
            summaryLessPaymentMethodsValues.push(summaryLessPaymentMethods[key])
        });
    }

    viewData.summaryLessPaymentMethods = JSON.stringify(summaryLessPaymentMethodsValues);

    viewData.disableEditButtons = querystring.indexOf('disableEditButtons=true') > -1;

    res.setViewData(viewData);

    next();    
});

// Prevent Checkout if online shopping is not enabled in the customer's country
server.prepend('Begin', function (req, res, next) {

    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    var currentCountry = Locale.getLocale(req.locale.id).country;
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    if (purchaseDisabled) {
        res.setStatusCode(404);
        res.render('error/notFoundPurchaseDisabled');
        this.emit('route:Complete', req, res);
        return;        
    }

    // prevent Adyen's PayPal from redirecting to placeOrder when payment raises errors
    var querystring = req.querystring.toString();
    if (querystring.indexOf('stage=placeOrder') > -1 && querystring.indexOf('paymentError') > -1) {
        var URLUtils = require('dw/web/URLUtils');
        var Resource = require('dw/web/Resource');
        res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', Resource.msg('error.payment.not.valid', 'checkout', null)));
    }

    return next();

});


// Prevent Checkout if online shopping is not enabled in the customer's country
server.prepend('Login', function (req, res, next) {

    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    var currentCountry = Locale.getLocale(req.locale.id).country;
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    if (purchaseDisabled) {
        res.setStatusCode(404);
        res.render('error/notFoundPurchaseDisabled');
        this.emit('route:Complete', req, res);
        return;        
    }

    return next();

});

server.append('Login', function (req, res, next) {

    var profileForm = server.forms.getForm('profile');
    profileForm.clear();

    var viewData = res.getViewData();
    viewData.profileForm = profileForm;
    res.setViewData(viewData);

    return next();

});

module.exports = server.exports();
