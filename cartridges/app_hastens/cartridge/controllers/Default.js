'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Replace Default controller in order to render PageDesigner homepage if exists, otherwise
 * render default homepage of the country detected by cookies and geolocation, or
 * redirecting to a language selector page when both of them are unavailable
 */
 var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

 var server = require('server');
 var page = module.superModule;
 server.extend(page);
 
function getRedirectURL (localeToActive, countryToActive, destination, param) {
    var URLUtils = require('dw/web/URLUtils');
    var URLAction = require('dw/web/URLAction');

    var customCacheHelpers = require('*/cartridge/scripts/helpers/customCacheHelpers');
    var countries = customCacheHelpers.getCachedCountriesJson();

    var locale;
    for (var i = 0; i < countries.length; i++) {
        if ( (localeToActive && countries[i].id === localeToActive) ||
            (countryToActive && countries[i].id.split('_')[1] === countryToActive) ) {
            locale = countries[i];
            break;
        }
    };

    var url;
    if (locale) {
        if (locale.hasB2C) {
            url = URLUtils.https(new URLAction(destination, locale.siteID, locale.id));
            if (param !== null) { url = URLUtils.https(new URLAction(destination, locale.siteID, locale.id), param); }
        } else {
            url = locale.redirectUrl;
        }
    }

    return url;
}

server.replace('Start', csrfProtection.generateToken, function (req, res, next) {
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var PageMgr = require('dw/experience/PageMgr');

    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);

    var destination = 'Home-Show';
    var param = null;

    var httpQueryString = req.httpHeaders.get('x-is-query_string') || '';
    if (httpQueryString.indexOf('devMode') === -1) {
        var geolocation = request.geolocation;
        let cookies = request.getHttpCookies();
        var localeSaved = null;
        for (let i = 0; i < cookies.cookieCount; i++) {
            if (cookies[i].name === 'lastVisited') {
                localeSaved = cookies[i].value;
            }
        }

        if (localeSaved !== null) {
            var redirectUrl = getRedirectURL(localeSaved, null, destination, param);
            if (redirectUrl) {
                res.redirect(redirectUrl);
                return next();
            }
        }

        if (geolocation !== null) {
            var redirectUrl = getRedirectURL(null, geolocation.countryCode, destination, param);
            if (redirectUrl) {
                res.redirect(redirectUrl);
                return next();
            }
        }
    }

    var showLanguageSelectorOnPageLoad = !localeSaved && !geolocation;
    req.setLocale('en');

    // get the PageDesigner home-page,
    var page = PageMgr.getPage('home-page');
    if (page != null && page.isVisible()) {
        /*
        if (!page.hasVisibilityRules()) {
            res.cachePeriod = 168; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
        }
        */
        res.page(page.ID, {showLanguageSelectorOnPageLoad: showLanguageSelectorOnPageLoad});
    } else {
        res.render('/home/homePage', {showLanguageSelectorOnPageLoad: showLanguageSelectorOnPageLoad});
    }

    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
