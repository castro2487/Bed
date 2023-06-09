'use strict';

const helpers = require('./BackendHelpers');

let Newsletter = {
    // Service constants
    SERVICE: {
        SUBSCRIBE: 'hastens.newsletter.subscribe',
    },

    subscribe: function (data) {
        return helpers.callApi(this.SERVICE.SUBSCRIBE, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Newsletter;
