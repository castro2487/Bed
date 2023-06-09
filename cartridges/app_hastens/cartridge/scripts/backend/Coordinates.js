'use strict';

const helpers = require('./BackendHelpers');

let Coordinates = {
    // Service constants
    SERVICE: {
        GET: 'hastens.coordinates.get',
    },

    getCoordinates: function () {
        return helpers.callApi(this.SERVICE.GET, 'GET');
    },
}

// Exports ===================================================================

module.exports = Coordinates;
