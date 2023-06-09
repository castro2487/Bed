'use strict';

var server = require('server');
var shippingservice = module.superModule;
server.extend(shippingservice);

server.append('PlaceOrder', function shippingMethodSelection(req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Transaction = require('dw/system/Transaction');
    var viewData = res.getViewData();
    var shippingMethods =  ShippingMgr.getAllShippingMethods().toArray();
    var order = OrderMgr.getOrder(viewData.orderID);
    var orderShipment = order.getShipments()[0];
    var sessionCustom = session.getPrivacy();
    var isDropOffMethod = false;
    shippingMethods.forEach(function (shippingMethod) {
        if (orderShipment.shippingMethodID === shippingMethod.ID && shippingMethod.custom.dropOffMethod) {
            isDropOffMethod = true;
        }
    });
    if (sessionCustom.drop_off_location_data && !empty(sessionCustom.drop_off_location_data) && isDropOffMethod) {
        var locationObject = JSON.parse(sessionCustom.drop_off_location_data);
        var orderCustom = order.getCustom();
        Transaction.wrap(function () {
            if (locationObject.location_code && !empty(locationObject.location_code)) {
                orderCustom.zenkraftDOPULocationCode = locationObject.location_code;
            }
            if (locationObject.location_name && !empty(locationObject.location_name)) {
                orderCustom.zenkraftDOPULocationName = locationObject.location_name;
            }
        });
    }
    return next();
});

module.exports = server.exports();
