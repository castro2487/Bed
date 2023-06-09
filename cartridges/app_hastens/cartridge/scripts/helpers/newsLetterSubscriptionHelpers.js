'use strict';

/* Global variables */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/**
 * @function subscribe Sends email subscription to Sales Cloud
 * @param email - email to subscribe
 * @return {Object} - The order export response
 */
function subscribe(email) {
    var result = {};

    try {

        // Create request body
        var requestObject = {
            "formSubmission" : {
                "email" : email,
                "formId" : "weboptin",
                "consent" : true
            }
        }

        // Initialize service
        var service = LocalServiceRegistry.createService('Newsletter.http.subscribe', {
            createRequest: function (service, req) {
                var credential = service.getConfiguration().credential;
                service.addHeader('client_id', credential.user);
                service.addHeader('client_secret', credential.password);
                service.addHeader('Content-Type', 'application/json');
                service.setRequestMethod('POST');
                return req;
            },
            parseResponse: function (svc, client) {                         
                return client.text;
            },
            mockCall: function() {        
                return {
                    statusCode: 200,
                    statusMessage: 'Success',
                    text: JSON.stringify({
                        data: "OK"
                    })
                };
            }
        });

        // Call servicepos, stringify the requestObject to accommodate Mulesoft
        var serviceResponse = service.call(JSON.stringify(requestObject));

        if(serviceResponse){
            result.subscribed = true;

            // Set result as success if endpoint was reached
            result.success = true;
        }
    } catch (error) {
        result.success = false;
    }
    return result;
}

module.exports = {
    subscribe: subscribe
};
