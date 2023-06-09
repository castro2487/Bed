'use strict';

var Logger = require('dw/system/Logger').getLogger('custom.job.orderStatusUpdate');
var Status = require('dw/system/Status');
var File = require('dw/io/File');
var FileReader = require('dw/io/FileReader');
var XMLStreamReader = require('dw/io/XMLStreamReader');
var XMLStreamConstants = require('dw/io/XMLStreamConstants');
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var WebDavModel = require('~/cartridge/models/webDavModel');
var Transaction = require('dw/system/Transaction');

var orderStatusUpdate = function(args) {
    if (empty(args.WorkingFolder)) {
        Logger.info('WARNING: WorkingFolder parameter is empty');
        return new Status(Status.ERROR, 'ERROR', 'WorkingFolder parameter is empty.');
    }

    // webdav model instance
    var webDavInstance = new WebDavModel();
    if (empty(webDavInstance)) {
        Logger.info('ERROR: No WebDav Model');
        return new Status(Status.ERROR, 'ERROR', 'No WebDav Model');
    }

    // get file list info from webdav
    var fileWebDavResult = webDavInstance.getFileList(args.WorkingFolder, 'IMPEX/src/');
    if (!fileWebDavResult.success) {
        Logger.info('ERROR: Get file INFO from WebDav Failed.');
        return new Status(Status.ERROR, 'ERROR', 'Get file INFO from WebDav Failed. Check the logs for more information.');
    }

    if (empty(fileWebDavResult.fileList)) {
        Logger.info('WARNING: File list from webdav is empty');
        return new Status(Status.OK, 'OK', 'WARNING: File list from webdav is empty.');
    }

    var files = fileWebDavResult.fileList
    
    for (var i = 0; i < files.length; i++) {
        //Process orders included in processed file
        processSingleFile(files[i]);
    }
    return new Status(Status.OK, 'OK', 'Job concluded successfully');
};

function processSingleFile(file) {
    Logger.debug('Processing: ' + file.name);
    var fileReader = new FileReader(file);
    var xmlStreamReader = new XMLStreamReader(fileReader);

    Logger.debug('Start reading XML');
    while (xmlStreamReader.hasNext()) {
        if (xmlStreamReader.next() === XMLStreamConstants.START_ELEMENT) {
            if (xmlStreamReader.getLocalName() === 'order') {
                var xmlObject = xmlStreamReader.readXMLObject();
                var orderId = xmlObject.attribute('order-no');
                var ns = xmlObject.namespace();

                var order = OrderMgr.getOrder(orderId);
                if (!order) {
                    Logger.info('Order {0} not found!', orderId);
                    continue;
                }

                Logger.info('Processing order {0}', orderId);

                Logger.info('Updating order status for order {0}', orderId);
                var status = xmlObject.ns::status;
                Transaction.begin();
                updateOrderStatus(order, status, ns);

                // Update orders custom fields + update order history
                Logger.info('Updating custom fields for order {0}', orderId);
                var customAttributes = xmlObject.ns::['custom-attributes'];
                var attributes = customAttributes.ns::['custom-attribute'];
                for (var i = 0; i < attributes.length(); i++) {
                    var customAttribute = attributes.attributes()[i];
                    var previousCustomAttributeValue = order.custom[customAttribute];
                    var newCustomAttributeValue = attributes[i];

                    if ((customAttribute == 'zenkraftOrderShippingStatus' || customAttribute == 'zenkraftOrderTrackingNumber' || customAttribute == 'zenkraftOrderCarrier') && previousCustomAttributeValue !== newCustomAttributeValue) {
                            order.custom[customAttribute] = newCustomAttributeValue;
                            order.trackOrderChange('SF external update: Update custom attribute ' + customAttribute + ' to ' + newCustomAttributeValue);
                    }
                }
                Transaction.commit();
            }
        }
    }
    xmlStreamReader.close();
    fileReader.close();
}

/**
 * Handle order cancellation
 * @param {*} order 
 * @param {*} orderStatus 
 * @param {*} ns 
 */
function updateOrderStatus(order, orderStatus, ns) {
    var tempStatus, orderCancelStatus;
    // Update order status
    if (orderStatus.ns::['order-status'].text().length() > 0) {
        tempStatus = orderStatus.ns::['order-status'].text().toString();
        if (tempStatus == 'CANCELLED' && tempStatus !== order.getStatus()) {
            orderCancelStatus = OrderMgr.cancelOrder(order);
            order.setCancelDescription('Order cancelled due to SF update');
            //order.setStatus(Order.ORDER_STATUS_CANCELLED);
            order.trackOrderChange('SF external update: Changed status to: CANCELLED');
        }
    }
}


exports.OrderStatusUpdate = orderStatusUpdate;
