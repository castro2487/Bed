'use strict';

var server = require('server');

server.extend(module.superModule);

server.get('Splash', function (req, res, next) {
    var Site = require('dw/system/Site');
    var Currency = require('dw/util/Currency');
    var Locale = require('dw/util/Locale');
    var currentLocale = Locale.getLocale(req.locale.id);

    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');

    // get currency associated with current locale
    var customCacheHelpers = require('*/cartridge/scripts/helpers/customCacheHelpers');
    var countries = customCacheHelpers.getCachedCountriesJson();

    var currencySymbol;
    for (var i = 0; i < countries.length; i++) {
        if (countries[i].id === currentLocale.ID) {
            currencySymbol = Currency.getCurrency(countries[i].currencyCode).getSymbol();
            break;
        }
    };

    var currentSite = Site.getCurrent();
    var allowedLocales = currentSite.allowedLocales;
    var siteId = currentSite.getID();


    var continents = require('*/cartridge/config/continents');
    continents.forEach(function (continent) {
        // sort countries of each continent alphabetically
        continent.countries.sort(function (a, b) {
            return Locale.getLocale("en_" + a).displayCountry < Locale.getLocale("en_" + b).displayCountry ? -1 : 1;
        });
    });

    var LocaleModel = require('*/cartridge/models/splashLocales');
    var localeModel = new LocaleModel(allowedLocales, siteId);

    var template = 'components/footer/countrySelector/splashCountrySelector';

    res.render(template, {
        currentLocale: currentLocale,
        currencySymbol: currencySymbol,
        continents: continents,
        localesByCountry: localeModel.groupedLocales,
        listOfCountryWithPurchaseOption: listOfCountryWithPurchaseOption
    });
    next();
});

// propose user to be redirect to the the site associated with their country
// and handle the related cookie, for saving the country preference 
server.get('Geoblock', function (req, res, next) {
    var template = '/components/header/geoblock';

    var Locale = require('dw/util/Locale');
    var Site = require('dw/system/Site');

    var geolocation = request.geolocation;

    if (!geolocation) {
        res.render(template, { countryFound: false });
        return next();
    }

    var currentSite = Site.getCurrent();
    var allowedLocales = currentSite.getAllowedLocales();
    var siteId = currentSite.getID();

    var LocaleModel = require('*/cartridge/models/splashLocales');
    var localeModel = new LocaleModel(allowedLocales, siteId);

    var currentLocale = Locale.getLocale(req.locale.id);

    var currentPhysicalCountry = geolocation.countryCode || 'NOT_AVAILABLE';
    var physicalCountryIsSameAsLocale = currentPhysicalCountry.toLowerCase() === currentLocale.country.toLowerCase();

    var localesOfCurrentCountry = localeModel.groupedLocales[currentPhysicalCountry];

    if (localesOfCurrentCountry) {
        var physicalCountryModel = localesOfCurrentCountry[0];
    }

    var physicalCountryFound = !!physicalCountryModel;

    let cookies = request.getHttpCookies();
    var localeSaved = '';
    for (let i = 0; i < cookies.cookieCount; i++) {
        if (cookies[i].name === 'lastVisited') {
            localeSaved = cookies[i].value;
        }
    }

    var countrySaved = localeSaved.split('_')[1];

    var currentCountryCode = currentLocale.country || 'UN';

    var hidden = (physicalCountryIsSameAsLocale || !physicalCountryFound || !physicalCountryModel || (countrySaved && countrySaved.toLowerCase() === currentCountryCode.toLowerCase()));

    var viewData = {
        currentCountryCode: currentCountryCode,
        physicalCountryModel: physicalCountryModel,
        physicalCountryIsSameAsLocale: physicalCountryIsSameAsLocale,
        currentLocale: currentLocale,
        countryFound: physicalCountryFound,
        countrySaved: countrySaved,
        hidden: hidden ? 'geoblockHidden' : ''
    };

    res.render(template, viewData);
    next();
});

server.replace('SetLocale', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var URLAction = require('dw/web/URLAction');
    var Currency = require('dw/util/Currency');
    var Site = require('dw/system/Site');
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');

    var currentBasket = BasketMgr.getCurrentBasket();

    var QueryString = server.querystring;
    var currency;
    var currentSite = Site.getCurrent();
    var allowedCurrencies = currentSite.allowedCurrencies;
    var queryStringObj = new QueryString(req.querystring.queryString || '');

    if (Object.hasOwnProperty.call(queryStringObj, 'lang')) {
        delete queryStringObj.lang;
    }

    var siteId = req.querystring.siteId;
    var redirectUrl;
    if (siteId !== currentSite.getID()) {
        redirectUrl = URLUtils.url(new URLAction(req.querystring.action, siteId, req.querystring.code)).toString();
    } else if (req.setLocale(req.querystring.code)) {
        currency = Currency.getCurrency(req.querystring.CurrencyCode);
        if (allowedCurrencies.indexOf(req.querystring.CurrencyCode) > -1
            && (req.querystring.CurrencyCode !== req.session.currency.currencyCode)) {
            req.session.setCurrency(currency);
            if (currentBasket && currency && currentBasket.currencyCode !== currency.currencyCode) {
                Transaction.wrap(function () {
                    currentBasket.updateCurrency();
                });
            }
        }
        redirectUrl = URLUtils.url(req.querystring.action).toString();
    }

    if (redirectUrl) {
        var qsConnector = redirectUrl.indexOf('?') >= 0 ? '&' : '?';
        redirectUrl = Object.keys(queryStringObj).length === 0
            ? redirectUrl += queryStringObj.toString()
            : redirectUrl += qsConnector + queryStringObj.toString();
        res.json({
            success: true,
            redirectUrl: redirectUrl
        });
    } else {
        res.json({
            success: false
        });
    }

    next();

});

server.append('SetLocale', function (req, res, next) {

    var viewData = res.getViewData();

    if (viewData.redirectUrl.indexOf('Order-Track') > -1) {
        var URLUtils = require('dw/web/URLUtils');
        res.json({
            success: true,
            redirectUrl: URLUtils.url('Login-Show').toString()
        });
    }

    next();
});

module.exports = server.exports();