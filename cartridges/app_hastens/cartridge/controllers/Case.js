'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Resource = require('dw/web/Resource');
var backend = require('~/cartridge/scripts/backend/BackendHelpers');
var formValidator = require('~/cartridge/scripts/formValidator');
var prefixes = require('*/cartridge/config/prefixes');
var countryNames = require('*/cartridge/config/countryNames');

const formHelper = {
    renderTextInput: function (field) {
        var parseErrorMsg = '';
        var rangeErrorMsg = '';
        var missingErrorMsg = '';
        
        switch(field.htmlName) {
            case 'dwfrm_contactus_firstname':
                missingErrorMsg = Resource.msg('address.firstname.missing', 'forms', null);
              break;
            case 'dwfrm_contactus_lastname':
                missingErrorMsg = Resource.msg('address.lastname.missing', 'forms', null);
                break;
            case 'dwfrm_contactus_phone':
                missingErrorMsg = Resource.msg('address.phone.missing', 'forms', null);
                parseErrorMsg = Resource.msg('error.message.phone.constraints.not.matched', 'forms', null);
                rangeErrorMsg = Resource.msg('error.message.phone.constraints.not.matched', 'forms', null);
                break;
            case 'dwfrm_contactus_email':
                missingErrorMsg = Resource.msg('error.card.info.missing.email', 'forms', null);
                parseErrorMsg = Resource.msg('forms.contactus.email.parse-error', 'forms', null);
                break;
            default:
                missingErrorMsg = Resource.msg('error.message.missing.value', 'forms', null);
        }

        if (field.maxlength === 50) {
            rangeErrorMsg = Resource.msg('error.message.50orless', 'forms', null)    
        }
        
        require('dw/template/ISML').renderTemplate('form/textinput', {
            field: field,
            parseErrorMsg: parseErrorMsg,
            rangeErrorMsg: rangeErrorMsg,
            missingErrorMsg: missingErrorMsg
        });
        return '';
    },
    renderSelectInput: function (field) {
        require('dw/template/ISML').renderTemplate('form/selectinput', {
            field: field,
            missingErrorMsg: Resource.msg('error.message.missing.option', 'forms', null)
        });
        return '';
    },
    renderTextarea: function (field, attributes) {
        field.attributes += ' ' + Object.keys(attributes).map(function (key) {
            return key + '="' + attributes[key] + '"';
        }).join(' ');
        require('dw/template/ISML').renderTemplate('form/textarea', {
            field: field,
            missingErrorMsg: Resource.msg('error.message.missing.value', 'forms', null)
        });
        return '';
    }
};

server.extend(module.superModule);

server.replace(
    'Create',
    server.middleware.https,
    csrfProtection.generateToken,
    consentTracking.consent,
     function (req, res, next) {
        var contactusform = server.forms.getForm('contactus');
        contactusform.clear();

        var Locale = require('dw/util/Locale');
        var currentCountry = Locale.getLocale(req.locale.id).country;

        if (customer.authenticated) {
            contactusform.firstname.value = customer.profile.firstName;
            contactusform.lastname.value = customer.profile.lastName;
            contactusform.email.value = customer.profile.email;
            // if no prefix stored, initialize with the one associated with the current locale
            contactusform.prefix.value = customer.profile.custom.prefix || prefixes[currentCountry];
            contactusform.prefixCountry.value = customer.profile.custom.prefixCountry || currentCountry;
            contactusform.phone.value = customer.profile.phoneHome.slice(customer.profile.custom.prefix ? customer.profile.custom.prefix.length : 0);
        } else {
            contactusform.prefix.value = prefixes[currentCountry];
            contactusform.prefixCountry.value = currentCountry;
        }
        res.render('case/contactus', {
            formHelper: formHelper,
            ConfirmationMessage: req.querystring.ConfirmationMessage,
            ErrorMessage: req.querystring.ErrorMessage,
            form: contactusform,
            prefixes: prefixes,
            countryNames: countryNames
        });
        next();
    }
);

server.replace(
    'SaveCase',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.validateRequest,
    csrfProtection.generateToken,
    function (req, res, next) {
        var contactusform = server.forms.getForm('contactus');

        var data = request.getHttpParameterMap();

        var params = {
            'secret': '6LcwixYTAAAAAGRhkb5tlINO2oLJ7D-iuyPWFhvK',
            'response': data['g-recaptcha-response'].value
        };

        var response = backend.callApi('hastens.google.recaptcha', 'GET', params);
        if (response.status !== 'OK' || response.body.success === false) {
            res.render('case/contactus', {
                formHelper: formHelper,
                ErrorMessage: Resource.msg('contactus.error.recaptcha', 'forms', null),
                form: contactusform,
                prefixes: prefixes,
                countryNames: countryNames
            });

            return next();
        }

        if (contactusform.valid) {
            const comment = {
                comment_type: 'contact_form',
                comment_author: contactusform.firstname.value + ' ' + contactusform.lastname.value,
                comment_author_email: contactusform.email.value,
                comment_content: contactusform.comment.value,
            };
            const isValid = formValidator.validateForm(req, comment, 'case/contactus');

            if (!isValid) {
                // For now, just ignore the form entirely.
                contactusform.clear();
                res.render('case/contactus', {
                    formHelper: formHelper,
                    ErrorMessage: Resource.msg('contactus.error', 'forms', null),
                    form: contactusform,
                    prefixes: prefixes,
                    countryNames: countryNames
                });

                return next();
            }

            /**
             * @type {dw.system.HookMgr}
             */
            const HookMgr = require('dw/system/HookMgr');
            var hookID = 'app.case.created';
            // call hook if defined, otherwise send out email
            if (HookMgr.hasHook(hookID)) {
                var phone = contactusform.phone.value;
                contactusform.phone.value = contactusform.prefix.value + contactusform.phone.value;
                var result = HookMgr.callHook(
                    hookID,
                    hookID.slice(hookID.lastIndexOf('.') + 1),
                    contactusform
                );
                if (!result || result.status !== 'OK') {
                    contactusform.phone.value = phone;
                    contactusform.base.invalidateFormElement('Case creation failed, please try again later.');
                    res.render('case/contactus', {
                        formHelper: formHelper,
                        ErrorMessage: Resource.msg('contactus.error', 'forms', null),
                        form: contactusform,
                        prefixes: prefixes,
                        countryNames: countryNames
                    });
                } else {
                    res.render('case/contactus', {
                        ConfirmationMessage: 'edit'
                    });
                }
            } else {
                var Mail = require('dw/net/Mail');

                var email = new Mail();
                email.addTo(require('dw/system/Site').current.getCustomPreferenceValue('customerServiceEmail')
                || 'no-reply@salesforce.com');
                email.setSubject(contactusform.myquestion.value);
                email.setFrom(contactusform.email.value);

                email.setContent(contactusform.comment.value, 'text/html', 'UTF-8');
                email.send();

                res.render('case/contactus', {
                    ConfirmationMessage: 'Success'
                });
            }
        } else {
            res.render('case/contactus', {
                formHelper: formHelper,
                ErrorMessage: 'Error',
                form: contactusform,
                prefixes: prefixes,
                countryNames: countryNames
            });
        }

        return next();
    }
);

module.exports = server.exports();
