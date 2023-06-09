/* globals google */
'use strict';

const server = require('server');
const cache = require('*/cartridge/scripts/middleware/cache');
const consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
const storeHelpers = require('*/cartridge/scripts/helpers/storeHelpers');
const urlHelpers = require('~/cartridge/scripts/helpers/urlHelpers');
const Locale = require('dw/util/Locale');

/**
 * Set up and initialize the store locator page.
 *
 * NOTE: The initial search use an IP-based geolocation that often is quite
 *       imprecise. Figure out how this can be done better.
 */
server.get('Find', server.middleware.https, cache.applyDefaultCache, consentTracking.consent, function (req, res, next) {
    const queryString = urlHelpers.fixQueryString(req.querystring);
    const postalCode = req.querystring.postalCode;
    const geolocation = req.geolocation;
    const showMap = queryString.showMap || 'true';
    const horizontalView = queryString.horizontalView || 'true';

    const locale = Locale.getLocale(req.locale.id);
    const countryCode = geolocation ? geolocation.countryCode : 'SE';
    const localeCountry = locale.country ? locale.country : 'SE';
    const location = require('*/cartridge/scripts/backend/Location').placeDetails({country: localeCountry});
    var latitude = geolocation ? geolocation.latitude : null;
    var longitude = geolocation ? geolocation.longitude : null;
    // Initial match on country needs to use a large value so we don't miss any matches.
    var radius = 150;
    if (!empty(location.body)) {
        latitude = location.body.location.lat;
        longitude = location.body.location.lng;
        radius = location.body.radius;
    }

    const stores = getStores(radius, localeCountry, postalCode, latitude, longitude);
    const viewData = {
        stores: stores,
        horizontalView: horizontalView,
        showMap: showMap,
        showFields: 'true',
        currentCountryCode: countryCode,
        CurrentPageMetaData: {
            title: 'Store locator',
        },
        locale: locale.country ? locale.country : 'en',
        language: locale.language ? locale.language : 'en',
    };

    res.render('storeLocator/storeLocator', viewData);
    next();
});

/**
 * Find a single store by slug and display in the store locator.
 */
server.get('FindBySlug', server.middleware.https, cache.applyDefaultCache, consentTracking.consent, function(req, res, next) {
    const StoresModel = require('*/cartridge/models/stores');
    const Site = require('dw/system/Site');
    const SystemObjectMgr = require('dw/object/SystemObjectMgr');

    const store = SystemObjectMgr.querySystemObject('Store', 'custom.slug = {0}', req.querystring.s);
    const storeSet = new dw.util.HashSet();
    if (store) {
        storeSet.add(store);
    }

    const localeCountry = Locale.getLocale(req.locale.id).country;
    const localeLanguage = Locale.getLocale(req.locale.id).language;
    const apiKey = Site.getCurrent().getCustomPreferenceValue('mapAPI');
    const stores = new StoresModel(storeSet, null, 10, null, apiKey);

    const viewData = {
        stores: stores,
        horizontalView: 'true',
        isForm: 'true',
        showMap: 'true',
        showFields: 'false',
        currentCountryCode: store ? store.custom.countryCodeValue : localeCountry,
        CurrentPageMetaData: {
            title: 'Store locator',
        },
        locale: localeCountry,
        language: localeLanguage,
    };

    res.render('storeLocator/storeLocator', viewData);
    next();
});

/**
 * Perform a search on current location or a set search query.
 *
 * Note that the search is biased towards the current geolocation. This can
 * return strange matches in some cases. If that happens, try adding the
 * expected country to the query.
 */
server.get('FindStores', function(req, res, next) {
    const query = req.querystring.query;
    const minRadius = 10;

    let countryCode = req.querystring.countryCode || req.geolocation.countryCode || 'SE';
    let postalCode = req.querystring.postalCode || null;
    let latitude = req.querystring.lat || req.geolocation.latitude || 59.5032613;
    let longitude = req.querystring.long || req.geolocation.longitude || 15.9985774;
    let radius = minRadius;

    if (query) {
        const location = require('*/cartridge/scripts/backend/Location').placeDetails({q: query, lat: latitude, long: longitude});
        if (empty(location.body)) {
            // No result from the api, set up so getStores finds nothing.
            radius = radius * 2.5;
            postalCode = ''; 
        } else {
            countryCode = location.body.country_code;
            postalCode = ''; // Don't use postalCode from the result, it will override lat/long;
            latitude = location.body.location.lat;
            longitude = location.body.location.lng;
            // If we matched a country, radius needs to be set to a large value
            // so we don't miss any matches.
            radius = location.body.is_country ? location.body.radius : location.body.radius / 1000;
            if (radius < minRadius) {
                radius = minRadius;
            }
        }
    }

    let stores = getStores(radius, countryCode, postalCode, latitude, longitude);

    if (stores.stores.length === 0 && countryCode !== '') {
        // Found a place but no stores, increase search radius
        // TODO: Be a little smarter here. Maybe center map on search target etc.
        for (let loop = 5; loop > 0; loop--) {
            radius = radius * 2.5;
            stores = getStores(radius, countryCode, postalCode, latitude, longitude);
            if (stores.stores.length > 0) break;
        }
    }

    const locale = Locale.getLocale(req.locale.id).country;

    res.json({stores: stores, locale: locale});
    next();
});

function getStores(radius, countryCode, postalCode, latitude, longitude) {
    const place = {
        countryCode: countryCode,
        latitude: latitude,
        longitude: longitude,
    };

    return storeHelpers.getStores(radius, postalCode, latitude, longitude, place, true, null);
}

// Exports ===================================================================

module.exports = server.exports();
