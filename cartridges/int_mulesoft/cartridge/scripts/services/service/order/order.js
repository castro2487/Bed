'use strict';

/** Script / Modules */
const Url = require('*/cartridge/scripts/util/Url'),
    serviceUtils = require('~/cartridge/scripts/utils/serviceUtils.js'),
    mulesoftUtils = require('~/cartridge/scripts/utils/mulesoftUtils.js');

const logger = mulesoftUtils.getLogger('order');

/** Service Callback for 'mulesoft.customer.createorder' Service */
var createOrderCallbacks = {

    createRequest: function(svc, body) {
        serviceUtils.setServiceCredentials(svc);
        svc.addHeader('Content-Type', 'application/json');
        svc.setRequestMethod('POST');
        if (body) {
            return JSON.stringify(body);
        } else {
            return null;
        }
    },

    parseResponse: serviceUtils.parseResponse(logger),

    filterLogMessage: function(msg) {
        return msg;
    },

    mockCall: function() {
        var outcome = [
            {
                code: '100',
                codeDesc: 'ok'
            }
        ];

        return {
            statusCode: 200,
            statusMessage: 'Success',
            text: JSON.stringify({
                outcome: outcome
            })
        };
    }
};


/** Module Exports */
module.exports = {
    createOrderCallbacks: createOrderCallbacks
};