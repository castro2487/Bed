/* global request, empty, response, dw */
// Checkout.js

'use strict';

var server = require('server');
var account = module.superModule;
server.extend(account);

server.append('Show', function (req, res, next) {
    var Site = require('dw/system/Site');
    var viewData = res.getViewData();
    var order = viewData.account.orderHistory;
    var Zenkraft = require('~/cartridge/scripts/zenkraft');

    if (Site.getCurrent().getCustomPreferenceValue('enableZenkraftTrackingOnOrderHistory')) {
        var trackInfo;

        if (order && order.firstShipmentTrackNo !== 'Pending' && order.firstShipmentCarrier !== 'Pending') {
            trackInfo = Zenkraft.getTrackingInfo(order.firstShipmentTrackNo, order.firstShipmentCarrier.toLowerCase());
            if (!empty(trackInfo)) {
                order.trackStatus = trackInfo.status || 'Pending';
                order.tracking_stage = trackInfo.tracking_stage || 'CREATED';
            } else {
                order.trackStatus = 'Pending';
            }
        }
    }

    next();
});

module.exports = server.exports();
