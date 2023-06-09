'use strict';

var server = require('server');

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

server.extend(module.superModule);

function sendEmail(order) {
    var Site = require('dw/system/Site');
    var taxErrorOrderEmailAddresses = require('dw/system/Site').getCurrent().getCustomPreferenceValue('taxErrorOrderEmailAddresses');
    if (taxErrorOrderEmailAddresses.length > 0) {
        var Mail = require('dw/net/Mail');
        var email = new Mail();
        taxErrorOrderEmailAddresses.forEach( function (emailAddress) { email.addTo(emailAddress); });
        email.setSubject('Zero-Tax Order Error');
        email.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com');
        email.setContent(Resource.msgf('error.zero.tax.error', 'confirmation', null, order.orderNo) , 'text/html', 'UTF-8');
        email.send();
    }
}

server.replace(
    'Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order = OrderMgr.getOrder(req.querystring.ID);
        var token = req.querystring.token ? req.querystring.token : null;

        if (!order
            || !token
            || token !== order.orderToken
            || order.customer.ID !== req.currentCustomer.raw.ID
        ) {
            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }
        var lastOrderID = Object.prototype.hasOwnProperty.call(req.session.raw.custom, 'orderID') ? req.session.raw.custom.orderID : null;
        if (lastOrderID === req.querystring.ID) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        }

        var config = {
            numberOfLineItems: '*'
        };

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' },
            true
        );

        if (order.getCustomerEmail() && order.paymentInstrument.custom.adyenPaymentMethod === 'PayPal') {
            var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
            COHelpers.sendConfirmationEmail(order, req.locale.id);
        }

        //copy estimatedArrivalTime from order(shipment)
        orderModel.shipping[0].selectedShippingMethod.estimatedArrivalTime = order.shipments[0].custom.estimatedArrivalTime;

        var passwordForm;

        var reportingURLs = reportingUrlsHelper.getOrderReportingURLs(order);

        //sfra patched
        /* var CustomerMgr = require('dw/customer/CustomerMgr');
        var profile = CustomerMgr.searchProfile('email={0}', orderModel.orderEmail);
        if (profile) {
            var Transaction = require('dw/system/Transaction');
            Transaction.wrap(function () {
                order.setCustomer(profile.getCustomer());
            });
        } */

        var TaxMgr = require('dw/order/TaxMgr');
        var taxRate = TaxMgr.getTaxRate('Standard', currentLocale.country) * 100;

        var Site = require('dw/system/Site');
        var avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

        if (order.custom.ATZeroTaxError) {
            sendEmail(order);
        }

        if (!req.currentCustomer.profile) {
            passwordForm = server.forms.getForm('newPasswords');
            passwordForm.clear();
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: false,
                passwordForm: passwordForm,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID(),
                taxRate: taxRate,
                avataxEnabled: avataxEnabled
            });
        } else {

            var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');
            // save all used shipping addresses to address book of the logged in customer
            var allAddresses = addressHelpers.gatherShippingAddresses(order);
            var addressIDs = req.currentCustomer.addressBook.addresses.map(function (address) { return address.ID });
            var existingId;
            var newAddressId;
            var address;
            allAddresses.forEach(function (address) {
                if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
                    newAddressId = addressHelpers.generateAddressName(address);
                    existingId = addressIDs.some(function (savedAddressID) { return savedAddressID === newAddressId });
                    if (!existingId) {
                        addressHelpers.saveAddress(address, req.currentCustomer, newAddressId);
                    }
                }
            });

            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: true,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID(),
                taxRate: taxRate,
                avataxEnabled: avataxEnabled
            });
        }
        req.session.raw.custom.orderID = req.querystring.ID; // eslint-disable-line no-param-reassign
        return next();
    }
);

server.replace(
    'Details',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order = OrderMgr.getOrder(req.querystring.orderID);
        var orderCustomerNo = req.currentCustomer.profile.customerNo;
        var currentCustomerNo = order.customer.profile.customerNo;
        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            },
            {
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.url('Order-History').toString()
            }
        ];

        if (order && orderCustomerNo === currentCustomerNo) {
            var config = {
                numberOfLineItems: '*'
            };

            var currentLocale = Locale.getLocale(req.locale.id);

            var orderModel = new OrderModel(
                order,
                { config: config, countryCode: currentLocale.country, containerView: 'order' }
            );

            //copy estimatedArrivalTime from order(shipment)
            orderModel.shipping[0].selectedShippingMethod.estimatedArrivalTime = order.shipments[0].custom.estimatedArrivalTime;

            var exitLinkText = Resource.msg('link.orderdetails.orderhistory', 'account', null);
            var exitLinkUrl =
                URLUtils.https('Order-History', 'orderFilter', req.querystring.orderFilter);

            var TaxMgr = require('dw/order/TaxMgr');
            var taxRate = TaxMgr.getTaxRate('Standard', currentLocale.country) * 100;

            var Site = require('dw/system/Site');
            var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
            var taxCalculation = avataxSettings && avataxSettings.taxCalculation;
            var avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

            res.render('account/orderDetails', {
                order: orderModel,
                exitLinkText: exitLinkText,
                exitLinkUrl: exitLinkUrl,
                breadcrumbs: breadcrumbs,
                purchaseLocale: order.customerLocaleID,
                taxRate: taxRate,
                netTaxation: !taxCalculation && !taxRate,
                avataxEnabled: avataxEnabled
            });
        } else {
            res.redirect(URLUtils.url('Account-Show'));
        }
        next();
    }
);

// Prevent access to History if online shopping is not enabled in the customer's country
server.prepend('History', function (req, res, next) {

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

// Prevent access to Details if online shopping is not enabled in the customer's country
server.prepend('Details', function (req, res, next) {

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

server.append('Track', function (req, res, next) {

    var OrderMgr = require('dw/order/OrderMgr');
    var order = OrderMgr.getOrder(req.form.trackOrderNumber);

    if (order) {
        var viewData = res.getViewData();
        viewData.purchaseLocale = order.customerLocaleID;

        var Locale = require('dw/util/Locale');
        var currentLocale = Locale.getLocale(req.locale.id);    

        if (viewData.hasOwnProperty('profileForm')) {
            var URLUtils = require('dw/web/URLUtils');
            viewData.createAccountUrl = URLUtils.url('Account-SubmitRegistration', 'rurl', 1).relative().toString();

            var prefixes = require('*/cartridge/config/prefixes');
            var countryNames = require('*/cartridge/config/countryNames');
            viewData.currentCountry = currentLocale.country;
            viewData.prefixes = prefixes;
            viewData.countryNames = countryNames;
        }

        var TaxMgr = require('dw/order/TaxMgr');
        viewData.taxRate = TaxMgr.getTaxRate('Standard', currentLocale.country) * 100;

        var Site = require('dw/system/Site');
        var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
        var taxCalculation = avataxSettings && avataxSettings.taxCalculation;
        viewData.netTaxation = !taxCalculation && !viewData.taxRate;
        viewData.avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

        res.setViewData(viewData);
    }

    return next();
});

module.exports = server.exports();