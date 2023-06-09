
'use strict';

/* Job for export orders to OMS */

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('custom.job.OrderExport');
var Status = require('dw/system/Status');
var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var OrderSubmitModel = require('int_order_submit/cartridge/models/orderSubmitModel');
var Site = require('dw/system/Site');

/**
 * Sends the list of orders failing to create submit requests to the specified email addresses
 * @param {object} ordersFailingSubmission - Array of failing orders
 * @returns {void}
 */

function sendEmail(ordersFailingSubmission) {
    var failingOrderExportEmailAddresses = require('dw/system/Site').getCurrent().getCustomPreferenceValue('failingOrderExportEmailAddresses');

    if (failingOrderExportEmailAddresses.length > 0) {
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

        var Mail = require('dw/net/Mail');
        var email = new Mail();

        failingOrderExportEmailAddresses.forEach( function (emailAddress) { email.addTo(emailAddress); });

        email.setSubject('Orders failing export');
        email.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@testorganization.com');

        email.setContent(renderTemplateHelper.getRenderedHtml( { orders: ordersFailingSubmission}, '/job/ordersFailingExport'), 'text/html', 'UTF-8');
        email.send();
    }
}

/**
 * Generic export function that is called by all export functions.
* @param {array} args Job argument list
 */
var orderExport = function (args) {
    var maxOrderExportValue = require('dw/system/Site').getCurrent().getCustomPreferenceValue('orderExportErrorMaxCounter');
    var errorFlow = 0;

    var orderExportStatus = args.OrderExportStatus;

    try {
        Logger.info('Starting orders export job...');

        // get site ID
        var site = dw.system.Site.getCurrent().getID();
        if (empty(site)) {
            Logger.info('WARNING: site empty.');
            return new Status(Status.ERROR, 'ERROR', 'site empty');
        }

        // get all order with "Ready to Export" status
        if(orderExportStatus == "EXPORT_STATUS_READY"){
            //var orders = OrderMgr.searchOrders('(exportStatus = {0} AND (status = {1} OR status = {2}) AND confirmationStatus != {3})', 'exportStatus desc', Order.EXPORT_STATUS_READY, Order.ORDER_STATUS_OPEN, Order.ORDER_STATUS_NEW, Order.CONFIRMATION_STATUS_NOTCONFIRMED);
            var orders = OrderMgr.searchOrders('((exportStatus = {0} OR exportStatus = {1}) AND status != {2} AND paymentStatus = {3})', 'exportStatus desc', Order.EXPORT_STATUS_READY, Order.EXPORT_STATUS_FAILED, Order.ORDER_STATUS_CANCELLED, Order.PAYMENT_STATUS_PAID);
        }else{
            // get all order with "Export Failed" status
            if(orderExportStatus == "EXPORT_STATUS_FAILED"){
                var orders = OrderMgr.searchOrders('(exportStatus = {0} AND (status = {1} OR status = {2}) AND confirmationStatus != {3})', 'exportStatus desc', Order.EXPORT_STATUS_FAILED, Order.ORDER_STATUS_OPEN, Order.ORDER_STATUS_NEW, Order.CONFIRMATION_STATUS_NOTCONFIRMED);
            }
        }
        
        // check if there are orders to be exported
        if (empty(orders)) {
            Logger.info('WARNING: No Orders to Export.');
            return new Status(Status.OK, 'OK', 'No Orders to export.');
        }

        Logger.info('INFO: Start process orders.');

        var ordersFailingSubmission = [];

        while (orders.hasNext()) {
            var order = orders.next();
            var orderSubmitResult = null;
            var orderNo = null;
            Transaction.wrap(function () {
                orderNo = order.getOrderNo();

                // try to export the order only if it has not already failed submitting a request
                if((!order.custom.hasOwnProperty('orderSubmitRequestFailed') || !order.custom.orderSubmitRequestFailed) && !order.custom.orderSubmitRequestSucceded) {
                    Logger.info('Exporting order {0}', orderNo);

                    // try to export the order only if the error counter is less than site preference value
                    if(order.custom.orderExportErrorCounter < maxOrderExportValue) {
                        orderSubmitResult = OrderSubmitModel.submitOrder(order);

                        if (orderSubmitResult.hasOwnProperty('orderHistoryLog')) {
                            order.trackOrderChange(orderSubmitResult.orderHistoryLog);
                        }
            
                        if (orderSubmitResult.success) {
                            OrderSubmitModel.updateOrderExportStatus(order, orderSubmitResult.orderStatusFeedback);
                            if (order.getExportStatus().value === Order.EXPORT_STATUS_EXPORTED) {
                                Transaction.wrap(function () {
                                    order.custom.orderSubmitRequestSucceded = true;
                                });
                            }
                        }
                    } else {
                        Logger.info('WARNING: Order {0} reached the maximum number of export attempts.', orderNo);
                    }

                    if (order.getExportStatus().value === Order.EXPORT_STATUS_EXPORTED) {
                        Logger.info('Order {0} EXPORTED.', orderNo);
                    } else {
                        errorFlow += 1;
                        Logger.info('WARNING: Order {0} failed to export.', orderNo);
                    }
                }
            });
            if (orderSubmitResult && !orderSubmitResult.success) {
                Transaction.wrap(function () {
                    order.custom.orderSubmitRequestFailed = true;
                });
                ordersFailingSubmission.push({orderNo: orderNo, creationDate: order.creationDate});
            }
        }
        if (ordersFailingSubmission.length > 0) {
            sendEmail(ordersFailingSubmission);
        }
    } catch (error) {
        var errorMessage = error.message;
        Logger.info('Catched Critical Error: ' + errorMessage);
        return new Status(Status.ERROR, 'ERROR', 'Catched Critical Error: ' + errorMessage);
    }

    if (errorFlow) {
        return new Status(Status.OK, 'MAX_EXPORT_ATTEMPTS_EXCEEDED', 'Max number of export attempts reached. Check the logs for more information.');
    }

    return new Status(Status.OK, 'OK', 'Orders Export Concluded with NO ERRORS.');
};

exports.OrderExport = orderExport;
