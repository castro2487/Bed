'use strict';

var server = require('server');

server.extend(module.superModule);


// Prevent access to Login if online shopping is not enabled in the customer's country
server.prepend('Show', function (req, res, next) {

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
server.append('Show', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(req.locale.id);
    var prefixes = require('*/cartridge/config/prefixes');
    var countryNames = require('*/cartridge/config/countryNames');

    var viewData = res.getViewData();
    viewData.privacyPolicyUrl = URLUtils.url('Search-Show', 'cgid', 'privacy-policy');
    viewData.currentCountry = currentLocale.country;
    viewData.prefixes = prefixes;
    viewData.countryNames = countryNames;
    res.setViewData(viewData);

    return next();

});


module.exports = server.exports();