'use strict';

const helpers = require('./BackendHelpers');

let Salesforce = {
    // Service constants
    SERVICE: {
        NBD_LEAD: 'hastens.salesforce.nbd-lead',
    },

    nbdLead: function (data) {
        return helpers.callApi(this.SERVICE.NBD_LEAD, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Salesforce;
