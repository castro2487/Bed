'use strict';

const helpers = require('./BackendHelpers');

let Location = {
    // Service constants
    SERVICE: {
        GET_ALL_STORES: 'hastens.location.get-all-stores',
        GET_ALL_LOCATIONS: 'hastens.location.get-all-locations',
        PLACE_DETAILS: 'hastens.location.place-details',
    },

    getAllStores: function () {
        return helpers.callApi(this.SERVICE.GET_ALL_STORES, 'GET');
    },

    getAllLocations: function (showOnlyVividus) {
        let params = showOnlyVividus || false ? {showOnlyVividus: 'true'} : null;

        return helpers.callApi(this.SERVICE.GET_ALL_LOCATIONS, 'GET', params);
    },

    placeDetails: function(params) {
        return helpers.callApi(this.SERVICE.PLACE_DETAILS, 'GET', params);
    }
}

// Exports ===================================================================

module.exports = Location;
