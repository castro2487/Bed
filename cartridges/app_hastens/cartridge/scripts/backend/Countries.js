'use strict';

const helpers = require('./BackendHelpers');

let Countries = {
    // Service constants
    SERVICE: {
        GET_ALL: 'hastens.countries.get-all',
        DEFAULT_CUSTOMER: 'hastens.countries.default-customer',
    },

    defaultCustomer: function (params) {
        return helpers.callApi(this.SERVICE.DEFAULT_CUSTOMER, 'GET', params);
    },
}

// Exports ===================================================================

module.exports = Countries;
