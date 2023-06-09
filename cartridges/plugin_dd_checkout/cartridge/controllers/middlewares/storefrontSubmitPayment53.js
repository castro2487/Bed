'use strict';

function storefrontSubmitPayment(req, res, next) {
    var PaymentManager = require('dw/order/PaymentMgr');
    var HookManager = require('dw/system/HookMgr');
    var Resource = require('dw/web/Resource');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var viewData = {};
    var paymentForm = server.forms.getForm('billing');

    // verify billing form data
    var billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
    var contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);

    var formFieldErrors = [];
    if (Object.keys(billingFormErrors).length) {
        formFieldErrors.push(billingFormErrors);
    } else {
        viewData.address = {
            firstName: { value: paymentForm.addressFields.firstName.value },
            lastName: { value: paymentForm.addressFields.lastName.value },
            address1: { value: paymentForm.addressFields.address1.value },
            address2: { value: paymentForm.addressFields.address2.value },
            city: { value: paymentForm.addressFields.city.value },
            postalCode: { value: paymentForm.addressFields.postalCode.value },
            countryCode: { value: paymentForm.addressFields.country.value }
        };

        if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
            viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
        }
    }

    if (Object.keys(contactInfoFormErrors).length) {
        formFieldErrors.push(contactInfoFormErrors);
    } else {
        viewData.email = {
            value: paymentForm.contactInfoFields.email.value
        };

        viewData.phone = { value: paymentForm.contactInfoFields.phone.value };
    }

    var paymentMethodIdValue = paymentForm.paymentMethod.value;
    if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
        throw new Error(Resource.msg(
            'error.payment.processor.missing',
            'checkout',
            null
        ));
    }

    var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();

    var paymentFormResult;
    if (HookManager.hasHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase())) {
        paymentFormResult = HookManager.callHook('app.payment.form.processor.' + paymentProcessor.ID.toLowerCase(),
            'processForm',
            req,
            paymentForm,
            viewData
        );
    } else {
        paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
    }

    if (paymentFormResult.error && paymentFormResult.fieldErrors) {
        formFieldErrors.push(paymentFormResult.fieldErrors);
    }

    if (formFieldErrors.length || paymentFormResult.serverErrors) {
        // respond with form data and errors
        res.json({
            form: paymentForm,
            fieldErrors: formFieldErrors,
            serverErrors: paymentFormResult.serverErrors ? paymentFormResult.serverErrors : [],
            error: true
        });
        return next();
    }

    res.setViewData(paymentFormResult.viewData);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var BasketMgr = require('dw/order/BasketMgr');
        var HookMgr = require('dw/system/HookMgr');
        var PaymentMgr = require('dw/order/PaymentMgr');
        var Transaction = require('dw/system/Transaction');
        var AccountModel = require('*/cartridge/models/account');
        var OrderModel = require('*/cartridge/models/order');
        var URLUtils = require('dw/web/URLUtils');
        var Locale = require('dw/util/Locale');
        var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');

        var currentBasket = BasketMgr.getCurrentBasket();

        var billingData = res.getViewData();

        if (!currentBasket) {
            delete billingData.paymentInformation;

            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return;
        }

        var validatedProducts = validationHelpers.validateProducts(currentBasket);
        if (validatedProducts.error) {
            delete billingData.paymentInformation;

            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                redirectUrl: URLUtils.url('Cart-Show').toString()
            });
            return;
        }

        var billingAddress = currentBasket.billingAddress;
        var billingForm = server.forms.getForm('billing');
        var paymentMethodID = billingData.paymentMethod.value;
        var result;

        billingForm.creditCardFields.cardNumber.htmlValue = '';
        billingForm.creditCardFields.securityCode.htmlValue = '';

        Transaction.wrap(function () {
            if (!billingAddress) {
                billingAddress = currentBasket.createBillingAddress();
            }

            billingAddress.setFirstName(billingData.address.firstName.value);
            billingAddress.setLastName(billingData.address.lastName.value);
            billingAddress.setAddress1(billingData.address.address1.value);
            billingAddress.setAddress2(billingData.address.address2.value);
            billingAddress.setCity(billingData.address.city.value);
            billingAddress.setPostalCode(billingData.address.postalCode.value);
            if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                billingAddress.setStateCode(billingData.address.stateCode.value);
            }
            billingAddress.setCountryCode(billingData.address.countryCode.value);

            billingAddress.setPhone(billingData.phone.value);
            currentBasket.setCustomerEmail(billingData.email.value);
        });

        // if there is no selected payment option and balance is greater than zero
        if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
            var noPaymentMethod = {};

            noPaymentMethod[billingData.paymentMethod.htmlName] =
                Resource.msg('error.no.selected.payment.method', 'payment', null);

            delete billingData.paymentInformation;

            res.json({
                form: billingForm,
                fieldErrors: [noPaymentMethod],
                serverErrors: [],
                error: true
            });
            return;
        }

        var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

        // check to make sure there is a payment processor
        if (!processor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
            result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                'Handle',
                currentBasket,
                billingData.paymentInformation,
                paymentMethodID,
                req
            );
        } else {
            result = HookMgr.callHook('app.payment.processor.default', 'Handle');
        }

        // need to invalidate credit card fields
        if (result.error) {
            delete billingData.paymentInformation;

            res.json({
                form: billingForm,
                fieldErrors: result.fieldErrors,
                serverErrors: result.serverErrors,
                error: true
            });
            return;
        }

        if (HookMgr.hasHook('app.payment.form.processor.' + processor.ID.toLowerCase())) {
            HookMgr.callHook('app.payment.form.processor.' + processor.ID.toLowerCase(),
                'savePaymentInformation',
                req,
                currentBasket,
                billingData
            );
        } else {
            HookMgr.callHook('app.payment.form.processor.default', 'savePaymentInformation');
        }

        // Calculate the basket
        Transaction.wrap(function () {
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        // Re-calculate the payments.
        var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
            currentBasket
        );

        if (calculatedPaymentTransaction.error) {
            res.json({
                form: paymentForm,
                fieldErrors: [],
                serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                error: true
            });
            return;
        }

        var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
        if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
            req.session.privacyCache.set('usingMultiShipping', false);
            usingMultiShipping = false;
        }

        hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, paymentForm.contactInfoFields.email.htmlValue], function () {});

        var currentLocale = Locale.getLocale(req.locale.id);

        var basketModel = new OrderModel(
            currentBasket,
            { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
        );

        var accountModel = new AccountModel(req.currentCustomer);
        var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
            req,
            accountModel
        );

        delete billingData.paymentInformation;

        res.json({
            renderedPaymentInstruments: renderedStoredPaymentInstrument,
            customer: accountModel,
            order: basketModel,
            form: billingForm,
            error: false
        });
    });

    return next();
}

module.exports = storefrontSubmitPayment;
