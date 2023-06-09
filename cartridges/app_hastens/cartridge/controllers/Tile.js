'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    
    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    // Customer's country
    var currentCountry = Locale.getLocale(req.locale.id).country;
    // List of countries for which online shopping is not enabled
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    var viewData = res.getViewData();
    viewData.purchaseDisabled = purchaseDisabled;

    res.setViewData(viewData);

    next();
});

module.exports = server.exports();