'use strict';

var customCacheHelpers = require('*/cartridge/scripts/helpers/customCacheHelpers');
var countries = customCacheHelpers.getCachedCountriesJson();

var ApiLocale = require('dw/util/Locale');

/**
 * returns object needed to render links to change the locale of the site
 * @param {string} allowedLocales - list of allowed locales for the site
 * @param {string} siteId - id of the current site
 * @returns {Array} - array of Objects representing available locales
 */
function getLocaleOptions(allowedLocales, siteId) {
    var localeOption;
    var apiLocale;
    var apiLocaleEnglish;
    var localeOptions = [];
    var countryCode;

    var Site = require('dw/system/Site');
    var languagesInEnglish = Site.current.getCustomPreferenceValue('languagesInEnglish');
    languagesInEnglish = JSON.parse(languagesInEnglish);

    countries.forEach(function (locale) {
        apiLocale = ApiLocale.getLocale(locale.id);

        countryCode = apiLocale.country;

        localeOption = {
            localID: locale.id,
            countryCode: countryCode,
            displayCountry: apiLocale.displayCountry,
            currencyCode: locale.currencyCode,
            displayName: apiLocale.displayName,
            language: apiLocale.language,
            displayLanguage: apiLocale.displayLanguage,
            hasB2C: locale.hasB2C,
            siteID: locale.siteID
        };

        if (countryCode) {
            apiLocaleEnglish = ApiLocale.getLocale("en_" + countryCode);
            localeOption.displayCountryEnglish = apiLocaleEnglish ? apiLocaleEnglish.displayCountry : 'UNAVAILABLE';
            localeOption.displayLanguageEnglish = languagesInEnglish[apiLocale.language] || 'UNAVAILABLE';
        } else if (locale.id === 'en') {
            localeOption.displayCountryEnglish = "International site";
            localeOption.displayLanguageEnglish = "English";
            localeOption.countryCode = 'UN';
            localeOption.displayCountry = 'International';
            localeOption.displayName = localeOption.displayName + ' (International)';
        }

        if(locale.hasB2C === false) {
            localeOption.redirectUrl = locale.redirectUrl;
        }

        localeOptions.push(localeOption);
    });


    return localeOptions;
}

function groupLocalesByCountry(localeOptions) {
    var groupedLocales = {};
    var countryCode;
    localeOptions.forEach(function (locale) {
        countryCode = locale.countryCode;
        if (countryCode === "") {
            countryCode = 'UN';
        }
        if (!(countryCode in groupedLocales)) {
            groupedLocales[countryCode] = [];
        }
        groupedLocales[countryCode].push(locale);
    });

    var HashMap = require('dw/util/HashMap');
    for (var countryLocale in groupedLocales) {
        var locales = groupedLocales[countryLocale];
        var displayCountries  = locales.map( function (locale) { return locale.displayCountry } );
        var hashMap = new HashMap();
        displayCountries.forEach(function (country) { hashMap.put(country, country) });
        if (hashMap.size() !== displayCountries.length) {
            groupedLocales[countryLocale].forEach(function(locale) {
                Object.defineProperty(groupedLocales[countryLocale], 'showLanguageCode', { value: true });
            });
        }
    }

    return groupedLocales;
}

/**
 * Represents locales information in plain object
 * @param {string} allowedLocales - list of allowed locales for the site
 * @param {string} siteId - id of the current site
 * @constructor
 */
function Locale(allowedLocales, siteId) {
    this.localeOptions = getLocaleOptions(allowedLocales, siteId);
    this.groupedLocales = groupLocalesByCountry(this.localeOptions);
}

module.exports = Locale;
