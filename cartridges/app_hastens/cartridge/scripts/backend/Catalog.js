'use strict';

const helpers = require('./BackendHelpers');

let Catalog = {
    // Service constants
    SERVICE: {
        ORDER: 'hastens.catalog.order',
    },

    subscribe: function (data) {
        return helpers.callApi(this.SERVICE.ORDER, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Catalog;
