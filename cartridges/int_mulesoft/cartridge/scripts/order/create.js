'use strict';

var Order = require('dw/order/Order');
var ServiceFactory = require('~/cartridge/scripts/services/OrderServiceFactory');


function createOrder(requestObject) {

    // Initialize service
    var service = ServiceFactory.createService(ServiceFactory.MULESOFT_ORDER_CREATE);
    var serviceResult = service.call(requestObject);

    return serviceResult;
}

module.exports.create = createOrder;
