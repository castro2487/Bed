'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

server.extend(module.superModule);

server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var formErrors = require('*/cartridge/scripts/formErrors');
    //var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            Transaction.wrap(function () {
                var address = null;
                if (formInfo.addressId.equals(req.querystring.addressId) || !addressBook.getAddress(formInfo.addressId)) {
                    address = req.querystring.addressId
                        ? addressBook.getAddress(req.querystring.addressId)
                        : addressBook.createAddress(formInfo.addressId);
                }

                if (address) {
                    if (req.querystring.addressId) {
                        address.setID(formInfo.addressId);
                    }

                    // Save form's address
                    addressHelpers.updateAddressFields(address, formInfo);

                    // Send account edited email
                    //accountHelpers.sendAccountEditedEmail(customer.profile);

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Address-List').toString()
                    });
                } else {
                    formInfo.addressForm.valid = false;
                    formInfo.addressForm.addressId.valid = false;
                    formInfo.addressForm.addressId.error =
                        Resource.msg('error.message.idalreadyexists', 'forms', null);
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(addressForm)
                    });
                }
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }

    return next();
});

server.replace('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    //var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var addressId = req.querystring.addressId;
    var isDefault = req.querystring.isDefault;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    var UUID = address.getUUID();
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        var length;
        Transaction.wrap(function () {
            addressBook.removeAddress(address);
            length = addressBook.getAddresses().length;
            if (isDefault && length > 0) {
                var newDefaultAddress = addressBook.getAddresses()[0];
                addressBook.setPreferredAddress(newDefaultAddress);
            }
        });

        // Send account edited email
        //accountHelpers.sendAccountEditedEmail(customer.profile);

        if (length === 0) {
            res.json({
                UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null),
                message: Resource.msg('msg.no.saved.addresses', 'address', null)
            });
        } else {
            res.json({ UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null)
            });
        }
    });

    return next();
});

server.replace('SetDefault', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    //var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var addressId = req.querystring.addressId;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        Transaction.wrap(function () {
            addressBook.setPreferredAddress(address);
        });

        // Send account edited email
        //accountHelpers.sendAccountEditedEmail(customer.profile);

        res.redirect(URLUtils.url('Address-List'));
    });
    
    next();
});

// From plugin_service_cloud cartridge
server.append('SaveAddress', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if(customer.authenticated){
            require('dw/system/HookMgr').callHook('app.account.updated', 'updated', customer);
        }
    });
    next();
});

// From plugin_service_cloud cartridge
server.append('DeleteAddress', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if(customer.authenticated){
            require('dw/system/HookMgr').callHook('app.account.updated', 'updated', customer);
        }
    });
    next();
});

// From plugin_service_cloud cartridge
server.append('SetDefault', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if(customer.authenticated){
            require('dw/system/HookMgr').callHook('app.account.updated', 'updated', customer);
        }
    });
    next();
});

// Prevent access to Add Address if online shopping is not enabled in the customer's country
server.prepend('AddAddress', function (req, res, next) {

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

// Provide data for rendering phone prefix selector
server.append('AddAddress', function (req, res, next) {

    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(req.locale.id);
    var prefixes = require('*/cartridge/config/prefixes');
    var countryNames = require('*/cartridge/config/countryNames');

    var viewData = res.getViewData();
    viewData.prefixValue = prefixes[currentLocale.country];
    viewData.prefixCountry = currentLocale.country;
    viewData.prefixes = prefixes;
    viewData.countryNames = countryNames;

    res.setViewData(viewData);

    return next();

});

// Prevent access to Edit Address if online shopping is not enabled in the customer's country
server.prepend('EditAddress', function (req, res, next) {

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

// Provide data for rendering phone prefix selector
server.append('EditAddress', function (req, res, next) {

    var Locale = require('dw/util/Locale');
    var prefixes = require('*/cartridge/config/prefixes');
    var countryNames = require('*/cartridge/config/countryNames');

    var viewData = res.getViewData();
    viewData.prefixes = prefixes;
    viewData.countryNames = countryNames;

    var addressBook = req.currentCustomer.raw.addressBook;
    var addressId = req.querystring.addressId;
    var rawAddress = addressBook.getAddress(addressId);

    // if no prefix stored, initialize with the one associated with the current locale
    if (rawAddress.custom.prefix) {
        viewData.prefixValue = rawAddress.custom.prefix;
        viewData.prefixCountry = rawAddress.custom.prefixCountry;
    } else {
        var currentCountry = Locale.getLocale(req.locale.id).country;
        viewData.prefixValue = prefixes[currentCountry];
        viewData.prefixCountry = currentCountry;
    }

    res.setViewData(viewData);

    return next();

});

// Prevent access to Address Book if online shopping is not enabled in the customer's country
server.prepend('List', function (req, res, next) {

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

server.append('List', function (req, res, next) {
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(req.locale.id);

    var viewData = res.getViewData();
    viewData.currentCountry = currentLocale.country;
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();
