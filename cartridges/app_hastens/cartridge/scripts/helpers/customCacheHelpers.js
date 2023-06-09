'use strict';

/**
 * @function getCachedCountriesJson Gets cached countries json global preference value
 * @return {Object} - cached countries
 */
function getCachedCountriesJson() {
    return getCachedJsonData('countriesJSONOrganizationPreferences', 'countries');
}

/**
 * @function getCachedCountryNamesJson Gets cached country names json global preference value
 * @return {Object} - cached countries
 */
function getCachedCountryNamesJson() {
    return getCachedJsonData('countryNamesJSONOrganizationPreferences', 'countryNames');
}

/**
 * @function getCachedJsonData Gets a cached global preference value
 * @return {Object} - data
 */
function getCachedJsonData(cacheId, prefName) {
    const CacheMgr = require('dw/system/CacheMgr');
    const cache = CacheMgr.getCache(cacheId);

    const result = cache.get(prefName, function() {
        const System = require('dw/system/System');
        const globalPreferences = System.getPreferences();
        const data = globalPreferences.getCustom()[prefName];
        return JSON.parse(data);
    });

    return result;
}

module.exports = {
    getCachedCountriesJson: getCachedCountriesJson,
    getCachedCountryNamesJson: getCachedCountryNamesJson,
};
