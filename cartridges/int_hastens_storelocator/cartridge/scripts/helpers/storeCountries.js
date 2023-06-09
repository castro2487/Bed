'use strict';

/**
 * Get a list of all countries used in the store data.
 * Note that to get countryName set, the country info needs to be added to
 * Administration > Site Development > System Object Types > Store - Attribute Definitions > countryCode
 */
function getStoreCountries() {
    const SystemObjectMgr = require('dw/object/SystemObjectMgr');
    const storeList = SystemObjectMgr.querySystemObjects('Store', '', 'ID asc').asList();

    let countries = [];
    let usedCountryIDs = [];

    for (let i = 0; i < storeList.length; i++) {
        if (usedCountryIDs.indexOf(storeList[i].countryCode.value) < 0) {
            countries.push({
                countryCode: storeList[i].countryCode.value,
                countryName: storeList[i].countryCode.displayValue,
            });
            usedCountryIDs.push(storeList[i].countryCode.value);
        }
    }
    // TODO: Maybe not sort here, but use proper order set in the Store definition.
    //       That will let us have "important" countries first in the list.
    let compare = function(a, b) { return a.countryName.localeCompare(b.countryName); }

    return countries.sort(compare);
}

// Exports ===================================================================

exports.getStoreCountries = getStoreCountries;
