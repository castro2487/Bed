'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.extend(module.superModule);


server.replace(
    'SubmitShipping',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var URLUtils = require('dw/web/URLUtils');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

        var currentBasket = BasketMgr.getCurrentBasket();
        if (!currentBasket) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }

        var validatedProducts = validationHelpers.validateProducts(currentBasket);
        if (validatedProducts.error) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }

        var form = server.forms.getForm('shipping');
        var result = {};

        // verify shipping form data
        var shippingFormErrors = COHelpers.validateShippingForm(form.shippingAddress.addressFields);

        if (Object.keys(shippingFormErrors).length > 0) {
            req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'invalid');

            res.json({
                form: form,
                fieldErrors: [shippingFormErrors],
                serverErrors: [],
                error: true
            });
        } else {
            req.session.privacyCache.set(currentBasket.defaultShipment.UUID, 'valid');

            result.address = {
                addressId: form.shippingAddress.addressFields.addressId.value,
                firstName: form.shippingAddress.addressFields.firstName.value,
                lastName: form.shippingAddress.addressFields.lastName.value,
                address1: form.shippingAddress.addressFields.address1.value,
                address2: form.shippingAddress.addressFields.address2.value,
                city: form.shippingAddress.addressFields.city.value,
                postalCode: form.shippingAddress.addressFields.postalCode.value,
                countryCode: form.shippingAddress.addressFields.country.value,
                prefixCountry: form.shippingAddress.addressFields.prefixCountry.value,
                prefix: form.shippingAddress.addressFields.prefix.value,
                phone: form.shippingAddress.addressFields.phone.value
            };
            if (Object.prototype.hasOwnProperty
                .call(form.shippingAddress.addressFields, 'states')) {
                result.address.stateCode =
                    form.shippingAddress.addressFields.states.stateCode.value;
            }

            result.shippingBillingSame =
                form.shippingAddress.shippingAddressUseAsBillingAddress.value;

            result.shippingMethod = form.shippingAddress.shippingMethodID.value
                ? form.shippingAddress.shippingMethodID.value.toString()
                : null;

            result.isGift = form.shippingAddress.isGift.checked;

            result.giftMessage = result.isGift ? form.shippingAddress.giftMessage.value : null;

            res.setViewData(result);

            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var AccountModel = require('*/cartridge/models/account');
                var OrderModel = require('*/cartridge/models/order');
                var Locale = require('dw/util/Locale');
                var Transaction = require('dw/system/Transaction');
                var Resource = require('dw/web/Resource');

                var shippingData = res.getViewData();

                if (req.currentCustomer.profile) {
                    var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');

                    var addressBook = req.currentCustomer.raw.addressBook;

                    var formInfo = shippingData.address;
                    var addressId = shippingData.address.addressId;

                    // if not 'new address' form
                    if (addressId && addressId !== 'new address') {
                        Transaction.wrap(function () {
                            var address =  addressBook.getAddress(addressId);
                            if (address) {
                                // if no phone prefix stored update the related address fields
                                if (!address.custom.prefix || !address.custom.prefixCountry || (address.phone[0] !== '+')) {
                                    address.custom.prefix = formInfo.prefix || '';
                                    address.custom.prefixCountry = formInfo.prefixCountry || '';
                                    var phone = formInfo.phone || ''
                                    if (phone && phone[0] !== '+') {
                                        phone = address.custom.prefix + phone;
                                    }
                                    address.setPhone(phone);                                
                                }
                                if (address.firstName === formInfo.firstName &&
                                    address.lastName === formInfo.lastName &&
                                    address.phone === formInfo.prefix + formInfo.phone &&
                                    address.stateCode === formInfo.stateCode &&
                                    address.address1 === formInfo.address1) {
                                    address.setPostalCode(formInfo.postalCode);                                
                                }
                            }
                        });
                    }
                }

                COHelpers.copyShippingAddressToShipment(
                    shippingData,
                    currentBasket.defaultShipment
                );

                var giftResult = COHelpers.setGift(
                    currentBasket.defaultShipment,
                    shippingData.isGift,
                    shippingData.giftMessage
                );

                if (giftResult.error) {
                    res.json({
                        error: giftResult.error,
                        fieldErrors: [],
                        serverErrors: [giftResult.errorMessage]
                    });
                    return;
                }

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

                if (!currentBasket.billingAddress || (currentBasket.billingAddress.countryCode.value !== currentLocale.country)) {
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
                        // Copy over preferredAddress (use addressUUID for matching)
                        COHelpers.copyBillingAddressToBasket(
                            preferredAddress, currentBasket);
                    } else {
                        // Copy over first shipping address (use shipmentUUID for matching)
                        COHelpers.copyBillingAddressToBasket(
                            currentBasket.defaultShipment.shippingAddress, currentBasket);
                    }
                }

                // Copy email from shipping form
                Transaction.wrap(function () {
                    currentBasket.customerEmail = form.shippingAddress.addressFields.email.value;
                });

                var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
                if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                    req.session.privacyCache.set('usingMultiShipping', false);
                    usingMultiShipping = false;
                }

                COHelpers.recalculateBasket(currentBasket);

                var basketModel = new OrderModel(
                    currentBasket,
                    {
                        usingMultiShipping: usingMultiShipping,
                        shippable: true,
                        countryCode: currentLocale.country,
                        containerView: 'basket'
                    },
                    true
                );

                if (session.custom.avataxError) {
                    res.json({
                        form: server.forms.getForm('shipping'),
                        fieldErrors: [Resource.msg('error.zipcode.state.combination.not.valid', 'checkout', null)],
                        serverErrors: [],
                        avataxError: true,
                        error: true
                    });
                } else {
                    var Site = require('dw/system/Site');
                    var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));

                    res.json({
                        customer: new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country),
                        order: basketModel,
                        form: server.forms.getForm('shipping'),
                        netTaxation: avataxSettings && avataxSettings.taxCalculation
                    });
                }
            });
        }

        return next();
    }
);

server.replace('SelectShippingMethod', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    var Locale = require('dw/util/Locale');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;
    var shippingMethodID = req.querystring.methodID || req.form.methodID;
    var shipment;
    if (shipmentUUID) {
        shipment = ShippingHelper.getShipmentByUUID(currentBasket, shipmentUUID);
    } else {
        shipment = currentBasket.defaultShipment;
    }

    var viewData = res.getViewData();
    viewData.address = ShippingHelper.getAddressFromRequest(req);
    viewData.isGift = req.form.isGift === 'true';
    viewData.giftMessage = req.form.isGift ? req.form.giftMessage : null;
    res.setViewData(viewData);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var shippingData = res.getViewData();
        var address = shippingData.address;

        var currentLocale = Locale.getLocale(req.locale.id);
        var prefixes = require('*/cartridge/config/prefixes');

        try {
            Transaction.wrap(function () {
                var shippingAddress = shipment.shippingAddress;

                if (!shippingAddress) {
                    shippingAddress = shipment.createShippingAddress();
                }

                shippingAddress.setFirstName(address.firstName || '');
                shippingAddress.setLastName(address.lastName || '');
                shippingAddress.setAddress1(address.address1 || '');
                shippingAddress.setAddress2(address.address2 || '');
                shippingAddress.setCity(address.city || '');
                shippingAddress.setPostalCode(address.postalCode || '');
                shippingAddress.setStateCode(address.stateCode || '');
                shippingAddress.setCountryCode(address.countryCode || '');
                shippingAddress.setPhone(address.phone || '');

                shippingAddress.custom.prefix = address.prefix || prefixes[currentLocale.country];
                shippingAddress.custom.prefixCountry = address.prefixCountry || currentLocale.country.toLowerCase();

                ShippingHelper.selectShippingMethod(shipment, shippingMethodID);

                basketCalculationHelpers.calculateTotals(currentBasket);
            });
        } catch (err) {
            res.setStatusCode(500);
            res.json({
                error: true,
                errorMessage: Resource.msg('error.cannot.select.shipping.method', 'cart', null)
            });

            return;
        }

        COHelpers.setGift(shipment, shippingData.isGift, shippingData.giftMessage);

        var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');

        var basketModel = new OrderModel(
            currentBasket,
            { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }, true
        );

        res.json({
            customer: new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country),
            order: basketModel
        });
    });

    return next();
});


server.replace('UpdateShippingMethodsList', server.middleware.https, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var AccountModel = require('*/cartridge/models/account');
    var OrderModel = require('*/cartridge/models/order');
    var URLUtils = require('dw/web/URLUtils');
    var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    var Locale = require('dw/util/Locale');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var shipmentUUID = req.querystring.shipmentUUID || req.form.shipmentUUID;
    var shipment;
    if (shipmentUUID) {
        shipment = ShippingHelper.getShipmentByUUID(currentBasket, shipmentUUID);
    } else {
        shipment = currentBasket.defaultShipment;
    }

    var address = ShippingHelper.getAddressFromRequest(req);

    var shippingMethodID;

    if (shipment.shippingMethod) {
        shippingMethodID = shipment.shippingMethod.ID;
    }

    Transaction.wrap(function () {
        var shippingAddress = shipment.shippingAddress;

        if (!shippingAddress) {
            shippingAddress = shipment.createShippingAddress();
        }

        Object.keys(address).forEach(function (key) {
            if (key !== 'prefixCountry' && key !== 'prefix') {
                var value = address[key];
                if (value) {
                    shippingAddress[key] = value;
                } else {
                    shippingAddress[key] = null;
                }
            }
        });

        shippingAddress.custom.prefix = req.form.prefix;
        shippingAddress.custom.prefixCountry = req.form.prefixCountry;

        ShippingHelper.selectShippingMethod(shipment, shippingMethodID);

        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    var currentLocale = Locale.getLocale(req.locale.id);

    var basketModel = new OrderModel(
        currentBasket,
        { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' },
        true
    );

    res.json({
        customer: new AccountModel(req.currentCustomer, undefined, undefined, currentLocale.country),
        order: basketModel,
        shippingForm: server.forms.getForm('shipping')
    });

    return next();
});

// Copy append from zenkraft cartridge
server.append('SubmitShipping', function shippingMethodSelection(req, res, next) {
    var Site = require('dw/system/Site');

    if (Site.getCurrent().getCustomPreferenceValue('enableZenkraftEstimatedDeliveryDates')) {
        var zenkraft = require('*/cartridge/scripts/zenkraft'); // eslint-disable-line vars-on-top
        var zenkraftHelper = require('*/cartridge/scripts/helpers/zenkraftHelper'); // eslint-disable-line vars-on-top, max-len
        var BasketMgr = require('dw/order/BasketMgr');
        var Transaction = require('dw/system/Transaction');
        var currentBasket = BasketMgr.getCurrentBasket();

        this.on('route:BeforeComplete', function shippingMethodSelection(req, res) { // eslint-disable-line no-shadow, max-len
            var thisViewData = res.getViewData(); // eslint-disable-line vars-on-top
            if(!('error' in thisViewData) && !thisViewData.error) {
                var thisAddress = thisViewData.order.shipping[0].shippingAddress; // eslint-disable-line vars-on-top, max-len
                var thisMethods = thisViewData.order.shipping[0].applicableShippingMethods; // eslint-disable-line vars-on-top, max-len
                var thisItems = thisViewData.order.items; // eslint-disable-line vars-on-top
                var thisDates = []; // eslint-disable-line vars-on-top
                var thisMethWithDates = []; // eslint-disable-line vars-on-top

                thisDates = zenkraft.getShippingData(thisAddress, thisItems, thisMethods);

                // if we get dates back
                if (!empty(thisDates)) { // eslint-disable-line no-undef
                    thisMethods.forEach(function filterMethods(method) {
                        var thisMethod = zenkraftHelper.filterShippingMethodsForEstimatedDate(method, thisDates);
                        thisMethWithDates.push(thisMethod);

                        if(thisMethod.selected) {
                            thisViewData.order.shipping[0].selectedShippingMethod = thisMethod;
                        }
                    });

                    thisViewData.order.shipping[0].applicableShippingMethods = thisMethWithDates;
                }

                res.setViewData(thisViewData);

                // save the selected shipping method arrival time on Basket's Shipment
                Transaction.wrap(function () {
                    currentBasket.shipments[0].custom.estimatedArrivalTime = thisViewData.order.shipping[0].selectedShippingMethod.estimatedArrivalTime;
                });
            }
        });
    }
    return next();
});

server.append('SelectShippingMethod', function shippingMethodSelection(req, res, next) {
    var Site = require('dw/system/Site');

    if (Site.getCurrent().getCustomPreferenceValue('enableZenkraftEstimatedDeliveryDates')) {
        var zenkraft = require('*/cartridge/scripts/zenkraft'); // eslint-disable-line vars-on-top
        var zenkraftHelper = require('*/cartridge/scripts/helpers/zenkraftHelper'); // eslint-disable-line vars-on-top, max-len
        this.on('route:BeforeComplete', function getShipmentsData(req, res) { // eslint-disable-line no-shadow, max-len
            var thisViewData = res.getViewData(); // eslint-disable-line vars-on-top

            var thisAddress = thisViewData.order.shipping[0].shippingAddress; // eslint-disable-line vars-on-top, max-len
            var thisMethods = thisViewData.order.shipping[0].applicableShippingMethods; // eslint-disable-line vars-on-top, max-len
            var thisItems = thisViewData.order.items; // eslint-disable-line vars-on-top
            var thisDates = []; // eslint-disable-line vars-on-top
            var thisMethWithDates = []; // eslint-disable-line vars-on-top

            thisDates = zenkraft.getShippingData(thisAddress, thisItems, thisMethods);

      // if we get dates back
            if (!empty(thisDates)) { // eslint-disable-line no-undef
                thisMethods.forEach(function filterMethods(method) {
                    var thisMethod = zenkraftHelper.filterShippingMethodsForEstimatedDate(method, thisDates); // eslint-disable-line vars-on-top, max-len
                    thisMethWithDates.push(thisMethod);

                    if(thisMethod.selected) {
                        thisViewData.order.shipping[0].selectedShippingMethod = thisMethod;
                    }
                });

                thisViewData.order.shipping[0].applicableShippingMethods = thisMethWithDates;
            }

            res.setViewData(thisViewData);
        });
    }
    return next();
});

server.append('UpdateShippingMethodsList', function shippingMethodSelection(req, res, next) {
    var Site = require('dw/system/Site');

    if (Site.getCurrent().getCustomPreferenceValue('enableZenkraftEstimatedDeliveryDates')) {
        var zenkraft = require('*/cartridge/scripts/zenkraft'); // eslint-disable-line vars-on-top
        var zenkraftHelper = require('*/cartridge/scripts/helpers/zenkraftHelper'); // eslint-disable-line vars-on-top, max-len
        var thisViewData = res.getViewData(); // eslint-disable-line vars-on-top
        var thisAddress = thisViewData.order.shipping[0].shippingAddress; // eslint-disable-line vars-on-top, max-len
        var thisMethods = thisViewData.order.shipping[0].applicableShippingMethods; // eslint-disable-line vars-on-top, max-len
        var thisItems = thisViewData.order.items; // eslint-disable-line vars-on-top
        var thisDates = []; // eslint-disable-line vars-on-top
        var thisMethWithDates = []; // eslint-disable-line vars-on-top

        thisDates = zenkraft.getShippingData(thisAddress, thisItems, thisMethods);

    // if we get dates back
        if (!empty(thisDates)) { // eslint-disable-line no-undef
            thisMethods.forEach(function filterMethods(method) {
                var thisMethod = zenkraftHelper.filterShippingMethodsForEstimatedDate(method, thisDates); // eslint-disable-line vars-on-top, max-len
                thisMethWithDates.push(thisMethod);

                if(thisMethod.selected) {
                    thisViewData.order.shipping[0].selectedShippingMethod = thisMethod;
                }
            });

            thisViewData.order.shipping[0].applicableShippingMethods = thisMethWithDates;
        }

        res.setViewData(thisViewData);
    }
    next();
});

module.exports = server.exports(); 