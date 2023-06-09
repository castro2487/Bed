'use strict';

const helpers = require('./BackendHelpers');

let WordpressPWA = {
    // Service constants
    SERVICE: {
        NEWSFEED: 'hastens.pwa.newsfeed',
    },

    newsfeed: function () {
        return helpers.callApi(this.SERVICE.NEWSFEED, 'GET');
    },
}

// Exports ===================================================================

module.exports = WordpressPWA;
