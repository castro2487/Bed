'use strict';

/* Global variables */
var OrderSubmitHelper = require('~/cartridge/scripts/orderSubmitHelper');
var Transaction = require('dw/system/Transaction');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Result = require('dw/svc/Result');
var Order = require('dw/order/Order');

/**
 * This Model provides functionality in order to integrate SFCC with OMS
 *
 * @module models/OrderSubmitModel
 */
var OrderSubmitModel = {
    /**
     * @function updateOrderExportStatus Processes order on SFCC size, confirming export. Use to confirm order export
     * @param order - order
     * @param orderNewStatus - SFCC Order Status
     * @return {Order} - The order object after transaction
     */

    updateOrderExportStatus: function (order, orderNewStatus) {
        Transaction.wrap(function () {
            order.setExportStatus(orderNewStatus);
        });
        return order;
    },

    /**
     * @function submitOrder Exports order to OMS Order Management System
     * @param order - order
     * @return {Object} - The order export response
     */
    submitOrder: function (order) {
        var result = {};

        try {

            var requestObject = OrderSubmitHelper.createOrderSubmitRequest(order);

            if (empty(requestObject)) {
                result.orderHistoryLog = 'Failed to create order submit request object';
                result.success = false;
                return result;
            }

            // // Initialize service
            var service = LocalServiceRegistry.createService('OMS.http.submitorder', {
                createRequest: function (service, req) {
                    var credential = service.getConfiguration().credential;
                    service.addHeader('client_id', credential.user);
                    service.addHeader('client_secret', credential.password);
                    service.addHeader('Content-Type', 'application/xml;charset=utf-8');
                    service.setRequestMethod('POST');
                    return req;
                },
                parseResponse: function (svc, client) {                         
                    return client.text;
                },
                mockCall: function() {
                    var outcome = [
                        {
                            "hasErrors": false,
                            "results": [
                                {
                                    "referenceId": "SO",
                                    "id": "a0g1x000003DSRKAA4"
                                },
                                {
                                    "referenceId": "SOL",
                                    "id": "a0f1x000001OTi7AAG"
                                }
                            ],
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
            });

            // // Call service
            var serviceResponse = service.call(requestObject);

            // Service was called and got feedback, set suc
            result.success = true;

            var errorMessage;
            if(serviceResponse && serviceResponse.getErrorMessage()){
                errorMessage = serviceResponse.getErrorMessage();
            }

            if (serviceResponse.status === Result.OK) {
                // Order created succesfully in OMS 
                var responseObject = JSON.parse(serviceResponse.getObject());
                result.orderStatusFeedback = Order.EXPORT_STATUS_EXPORTED;
                result.orderHistoryLog = 'Order exported to OMS successfully - OMS Response: ' + JSON.stringify(responseObject);
                
            } else if (serviceResponse.status === Result.ERROR) {
                order.custom.orderExportErrorCounter = order.custom.orderExportErrorCounter + 1;
                //Manage error responses (i.e. order already inserted or error response)
                if(errorMessage && errorMessage.indexOf('DUPLICATES_DETECTED')>-1){
                    //Manage duplicate call. In this case order was already created on OMS (i.e. some timeout blocked the order status update in SFCC) - setting export status to true
                    result.orderStatusFeedback = Order.EXPORT_STATUS_EXPORTED;
                    result.orderHistoryLog = 'Order was already exported to OMS - OMS Response: ' + errorMessage;
                }else{
                    //Manage real error responses
                    if (serviceResponse.error === 400 || serviceResponse.error === 401) { 
                        // 400 and 401 => Order.EXPORT_STATUS_READY
                        result.orderStatusFeedback = Order.EXPORT_STATUS_READY;
                        result.orderHistoryLog = '[WARNING] Order export to OMS could not be processed; Order still ready for a retry - Service Reponse: ' + errorMessage;
                    } else { // 500 => Order.EXPORT_STATUS_FAILED (eg. timeout)
                        result.orderStatusFeedback = Order.EXPORT_STATUS_FAILED;
                        result.orderHistoryLog = '[ERROR] Order export to OMS failed- Service Reponse: ' + errorMessage;
                    }
                }
            } else { // serviceResponse.status === Result.SERVICE_UNAVAILABLE
                order.custom.orderExportErrorCounter = order.custom.orderExportErrorCounter + 1;
                result.orderStatusFeedback = Order.EXPORT_STATUS_READY;
                result.orderHistoryLog = '[WARNING] Order export to OMS could not be processed; Order still ready for a retry - Service Reponse: ' + errorMessage;
            }
        } catch (error) {
            result.success = false;
            result.orderStatusFeedback = Order.EXPORT_STATUS_READY;
            result.orderHistoryLog = '[WARNING] Something went wrong with call to OMS; Order still ready for a retry';
        }
        return result;
    }
};

module.exports = OrderSubmitModel;
