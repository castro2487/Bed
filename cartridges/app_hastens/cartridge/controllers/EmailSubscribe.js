'use strict';
var server = require('server');

server.extend(module.superModule);

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}

function sameAsLoggedIn(req, email){
    if(req.currentCustomer && req.currentCustomer.profile){
        if(req.currentCustomer.profile.email === email){
            return true;
        }
    }
    return false;
}

server.replace('Subscribe', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var newsLetterSubscriptionHelper = require('*/cartridge/scripts/helpers/newsLetterSubscriptionHelpers');

    var email = req.form.emailId;
    var isValidEmailid;
    if (email) {
        isValidEmailid = validateEmail(email);
        isSameAsLoggedIn = sameAsLoggedIn(req, email);

        if (isSameAsLoggedIn) {
            res.json({
                error: true,
                msg: Resource.msg('subscribe.email.same', 'homePage', null)
            });
        } else if (isValidEmailid) {
            var result = newsLetterSubscriptionHelper.subscribe(email);
            if(!result || !result.subscribed){
                res.json({
                    error: true,
                    msg: Resource.msg('subscribe.email.error', 'homePage', null)
                });
            } else {
                res.json({
                    success: true,
                    msg: Resource.msg('subscribe.email.success', 'homePage', null)
                });
            }
        } else {
            res.json({
                error: true,
                msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
            });
        }
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
        });
    }

    next();
});


module.exports = server.exports();
