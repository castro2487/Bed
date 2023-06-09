'use strict';

const server = require('server');
const userLocale = getUserLocale();

/**
 * RegEx used to identify system-generated requests that can be ignored
 * @type {RegExp}
 */
var systemRegEx = /__Analytics|__SYSTEM__/;
var isDefaultRegEx = /default/;

/**
 * Returns true if system request (Analytics, SYSTEM, etc)
 * @returns {boolean}
 */
function isSystemRequest() {
    return request.httpRequest && systemRegEx.test(request.httpURL.toString());
}

/**
 * Returns true if request contains default string
 * @returns {boolean}
 */
 function isRequestContainsDefaultLanguage() {
    return request.httpRequest && isDefaultRegEx.test(request.httpURL.toString());
}
 
/**
 * Returns true if script executing in Business Manager context (Sites-Site)
 * @returns {boolean}
 */
function isBM() {
    // if Sites-Site, we're in Business Manager
    return require('dw/system/Site').current.ID === 'Sites-Site';
}

/**
 * Redirect to path with geolocation user locale if locale is default and non is a BM or System request and contains default locale in path
 */
function onRequest() {
    let currentLocale = request.locale;
    if (currentLocale === 'default' && !isBM() && !isSystemRequest() && isRequestContainsDefaultLanguage()) {
        let destPath = getUrlWithLocale();
        request.setLocale(userLocale);
        response.redirect(destPath);
    }
}

/**
 * Get correct URL including user geolocation locale
 */
function getUrlWithLocale(locale) {
    var destPath = null;
    var locale = userLocale || 'en';
    var site = getSite(locale);
    if (!site) {
        locale = 'en';
        site = 'Hastens_EU';
    }
    destPath = request.httpProtocol + '://' + request.httpHost + request.httpPath.replace('default', locale).replace(/\Sites-(.*?)\-Site/, 'Sites-' + site + '-Site');
    var pathWithParams = request.httpPath + '?' + request.httpQueryString;
    var QueryString = server.querystring;
    var queryStringObj = new QueryString(pathWithParams || '');
    if (Object.keys(queryStringObj).length > 0) {
        var qsConnector = request.httpPath.indexOf('?') >= 0 ? '&' : '?';
        destPath += qsConnector + queryStringObj.toString().replace('null=undefined', '');
    }
    return destPath;
}

/**
 * Get the site a locale is associated with
 */
function getSite(locale) {
    var customCacheHelpers = require('*/cartridge/scripts/helpers/customCacheHelpers');
    var countries = customCacheHelpers.getCachedCountriesJson();
    var site;
    for (var i = 0; i < countries.length; i++) {
        if (countries[i].id === locale) {
            site = countries[i].siteID;
            break;
        }
    };
    return site;
}

/**
 * Get correct user geolocation locale
 */
function getUserLocale() {
    var geolocationLocale;
    if (request.geolocation && request.geolocation.countryCode) {
        var customCacheHelpers = require('*/cartridge/scripts/helpers/customCacheHelpers');
        var countries = customCacheHelpers.getCachedCountriesJson();
    
        for (var i = 0; i < countries.length; i++) {
            if ( countries[i].id.split('_')[1] === request.geolocation.countryCode ) {
                geolocationLocale = countries[i].id;
                break;
            }
        };
    }
    return geolocationLocale;
}

exports.onRequest = onRequest;