/* global request, empty, response, dw */
/**
* This controller provides integrations with the Zenkraft API.
*
* @module  controllers/Zenkraft
*/

'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var zenkraftMiddleware = require('*/cartridge/scripts/middleware/zenkraft');

/**
 * Gets Shipping Label from the Zenkraft API
 *
 * @return {Object} Object representing the shipping label
 */
server.post('GetShippingLabel',
    server.middleware.https,
    function getShippingLabelZenkraft(req, res, next) {
        var Site = require('dw/system/Site');
        var returnsRequireApproval = Site.getCurrent().getCustomPreferenceValue('enableZenkraftReturnsApproval');
        var syncReturnWithZenkraft = Site.getCurrent().getCustomPreferenceValue('syncReturnWithZenkraft');
        var OrderMgr = require('dw/order/OrderMgr');
        var Zenkraft = require('~/cartridge/scripts/zenkraft');
        var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
        var data;
        try {
            data = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
        } catch (e) {
            res.json({ error: 'Wrong request' });
            return next();
        }

        if (empty(data)) {
            res.json({ error: 'Wrong request' });
            return next();
        }

        var orderID = data.orderID;
        var items = data.items;
        if (empty(orderID) || empty(items)) {
            res.json({ error: 'Wrong request' });
            return next();
        }

        var order = OrderMgr.getOrder(orderID);
        if (empty(order)) {
            res.json({ error: 'No order found' });
            return next();
        }

        var products = {};
        items.forEach(function (item) {
            products[item.productID] = item.quantity;
        });

        var returnID = false;
        if (!returnsRequireApproval) {
            returnsRequireApproval = ZenkraftHelper.checkOrderRetrunApproval(order);
        }
        if (returnsRequireApproval) {
            if (Site.current.getCustomPreferenceValue('storeZenkraftReturnLabels')) {
                returnID = ZenkraftHelper.createUnapprovedZenkraftReturn(orderID, items);
            }
            res.json({
                returnsRequireApproval: returnsRequireApproval,
                returnID: returnID
            });
            return next();
        }
        var label = Zenkraft.getShippingLabel(order, products);

        if (empty(label) || label.error) {
            res.json({ error: 'No order found' });
            return next();
        }
        if (Site.current.getCustomPreferenceValue('storeZenkraftReturnLabels')) {
            returnID = ZenkraftHelper.saveReturnLabel(orderID, label, items);
        }
        if (returnID && empty(label.error) && syncReturnWithZenkraft) {
            // send zenkraft retrun sync
            Zenkraft.getSyncReturnRequest(label, order, items, returnID);
        }
        // set content to json
        res.json({
            shipment: label.shipment,
            returnID: returnID
        });
        return next();
    });

/**
* Sends a shipping label to a provided email address
*
* @return {Object} Object representing the shipping label
*/
server.post('SendShippingLabel',
  server.middleware.https,
  function sendShippingLabelZenkraft(req, res, next) {
      var OrderMgr = require('dw/order/OrderMgr');
      var Zenkraft = require('~/cartridge/scripts/zenkraft');
      var parameterMap = request.httpParameterMap;
      var order;
      var reqbody = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
      var products = reqbody.products;
      var email = reqbody.emailaddress;

      if (!empty(parameterMap.orderID)) {
          order = OrderMgr.getOrder(parameterMap.orderID);
      }

      if (!empty(order) && !empty(email)) {
          var label = Zenkraft.getShippingLabel(order, products, email); // eslint-disable-line vars-on-top, max-len

      // set content to json
          res.json(label);
          return next();
      // eslint-disable-next-line no-else-return
      } else {
          res.json({ error: 'No order found' });
          return next();
      }
  });


/**
* showTracking
* - Renders a public page for shipment tracking
*/

server.get('Track', server.middleware.https, function (req, res, next) { // eslint-disable-line consistent-return, max-len
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    var OrderMgr = require('dw/order/OrderMgr');
    var trackingHelper = require('~/cartridge/scripts/helpers/trackingHelper');
    var parameterMap = request.httpParameterMap;
    var trackingNo = parameterMap.tracknumber.isSubmitted() ? parameterMap.tracknumber.value : false;
    var orderNo = parameterMap.order.isSubmitted() ? parameterMap.order.value : false;
    var carrier = parameterMap.carrier.isSubmitted() ? parameterMap.carrier.value.toLowerCase() : false;
    var order = false;
    var trackingsData;
    var useParcelObjectforTracking = Site.getCurrent().getCustomPreferenceValue('useParcelObjectforTracking');

    if (!(Site.getCurrent().getCustomPreferenceValue('enableZenkraftTrackingPage'))) {
        res.redirect(URLUtils.url('Home-Show'));
        return next();
    }
    if (orderNo) {
        order = OrderMgr.getOrder(orderNo);
    }

    if (useParcelObjectforTracking) {
        trackingsData = trackingHelper.getParcelObjects(order, trackingNo, carrier);
    } else {
        trackingsData = trackingHelper.getSystemShipments(order, trackingNo, carrier);
    }

    res.render('account/tracking/tracking', { TrackingNo: trackingNo, TrackingsData: trackingsData, OrderNo: orderNo });
    return next();
});

/**
* Displays a page for a single shipment that allows users to
* request a shipping label for a return.
*/
server.post('PrintLabel',
    server.middleware.https,
    csrfProtection.validateRequest,
    function printReturnLabel(req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');

        var Order = OrderMgr.getOrder(req.form.orderno);
        // is the order created by the authenticated user
        /* if (Order.getCustomer() !== session.getCustomer()) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        } */
        var shipment = Order.getDefaultShipment();

        res.render('account/orderhistory/printLabel', { Order: Order, Shipment: shipment });
        next();
    }
);

/**
* AddNotification
* - Adds a new shipping notification custom object to the site
* - This custom object is used in a job to send notifications for changes
* in shipment status.
*
* @param {string} type - The type of notification (sms, voice, etc).
* @param {string} phone - Phone number (optional).
* @return {string} JSON object status success or failure.
*/
server.post('AddNotification', function addTrackNotificationCO(req, res, next) {
    var notifications = require('~/cartridge/scripts/notifications');
    var reqbody = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
    var orderNo = reqbody.orderNo && !empty(reqbody.orderNo) ? reqbody.orderNo : false;
    var shipmentNo = reqbody.shipmentNo && !empty(reqbody.shipmentNo) ? reqbody.shipmentNo : false;
    var notification = 'There was an issue when trying to subscribe you to SMS notifications. Please try again later.';
    var notifyObject = {
        type: !empty(reqbody.type) ? reqbody.type : false,
        contact: !empty(reqbody.contact) ? reqbody.contact : false,
        trackingNumber: !empty(reqbody.tracknumber) ? reqbody.tracknumber : false,
        carrier: !empty(reqbody.carrier) ? reqbody.carrier : false,
        stage: !empty(reqbody.stage) ? reqbody.stage : false,
        tracking_stage: !empty(reqbody.stage) ? reqbody.stage : false
    };

    if (reqbody.orderNo && !empty(reqbody.orderNo)) {
        notification = notifications.addNotificationObject(notifyObject, orderNo, shipmentNo);
    }

  // return success or failure response
    res.json({ success: notification });
    return next();
});

/**
* Displays a page for a single shipment that allows users to
* request a shipping label for a return.
*/
server.use('Returns', function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Locale = require('dw/util/Locale');
    var OrderMgr = require('dw/order/OrderMgr');
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    var OrderModel = require('*/cartridge/models/order');
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var order = '';
    var method = req.httpMethod;

    if (method === 'GET') {
        var isIdSubmitted = request.httpParameterMap.id.submitted;
        if (!isIdSubmitted) {
            res.setStatusCode(404);
            res.render('error/notFound');
            return next();
        }
        var zenkraftReturn = CustomObjectMgr.getCustomObject('zenkraftReturn', request.httpParameterMap.id);
        order = OrderMgr.getOrder(zenkraftReturn.custom.orderNumber);
        if (order.getCustomer() !== session.getCustomer()) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        }
        var address = order.shipments[0].shippingAddress;

        res.render('account/orderhistory/return', {
            zenkraftReturn: zenkraftReturn,
            address: address
        });
        return next();
    } else if (method === 'POST') {
        order = OrderMgr.getOrder(req.form.orderno);
        if (order.getCustomer() !== session.getCustomer()) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        }
        var reasons = Site.getCurrent().getCustomPreferenceValue('returnReasonsConfig');

        var labels = {};
        var labelModel = {};
        var returnsRequireApproval = Site.getCurrent().getCustomPreferenceValue('enableZenkraftReturnsApproval');
        if (!returnsRequireApproval) {
            returnsRequireApproval = ZenkraftHelper.checkOrderRetrunApproval(order);
        }
        var pageSettings = {
            returnsRequireApproval: returnsRequireApproval
        }
        var config = {
            numberOfLineItems: '*'
        };

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' }
        );

        if (!empty(reasons)) {
            reasons = JSON.parse(reasons);
        }

        // Check for existing labels for this order
        labels = CustomObjectMgr.queryCustomObjects('zenkraftReturn', 'custom.orderNumber={0}', 'creationDate desc', order.orderNo);

        // Serialize Iterator Objects
    /*     if (labels.count > 0) {
            while (labels.hasNext()) {
                var label = labels.next();
                labelModel[label.custom.productID] = {};

                labelModel[label.custom.productID].trackNumber = label.custom.trackingNo;
                labelModel[label.custom.productID].label = label.custom.labelURL;
                labelModel[label.custom.productID].labelType = label.custom.labelType.toLowerCase();
                break;
            }
        } */

        res.render('account/orderhistory/returns', {
            order: orderModel,
            reasons: reasons.reasons,
            labels: labelModel,
            pageSettings: pageSettings
        });
        return next();
    } else {
        res.setStatusCode(404);
        res.render('error/notFound');
        return next();
    }
});

/**
* Returns JSON of the nearest drop-off locations based
* on a shipping address
*/
server.post('GetNearestDropOffLocation', function (req, res, next) {
    var address = JSON.parse(request.httpParameterMap.getRequestBodyAsString()).address;
    var locations = {};
    var firstLocation = {};
    var zenkraft = require('~/cartridge/scripts/zenkraft');

    locations = zenkraft.getDropOffLocations(address);

    if (locations.locations) {
        firstLocation = locations.locations[0];
    } else {
        firstLocation = { error: 'Sorry, no drop-off locations were found near your shipping address.' };
    }

    res.json(firstLocation);
    return next();
});

  /**
  * Returns JSON of the nearest drop-off locations after the closest
  */
server.post('GetNearestDropOffLocations', function (req, res, next) {
    var address = JSON.parse(request.httpParameterMap.getRequestBodyAsString()).address;
    var locations = {};
    // eslint-disable-next-line no-unused-vars
    var otherLocations = {};
    var zenkraft = require('~/cartridge/scripts/zenkraft');

    locations = zenkraft.getDropOffLocations(address);

    if (locations) {
        otherLocations = delete locations.locations[0];
    }

    res.json(locations.locations);
    return next();
});

  /**
  * Returns JSON of shipping methods for a product along with
  * any estimated delivery dates from Zenkraft
  */
server.get('GetShippingMethodsForProduct', function (req, res, next) {
    var ShippingMgr = require('dw/order/ShippingMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var ShippingMethodModel = require('*/cartridge/models/shipping/shippingMethod');
    var collections = require('*/cartridge/scripts/util/collections');
    var zenkraft = require('~/cartridge/scripts/zenkraft');
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var shippingMethods;
    var shipMethods;
    var parameterMap = request.httpParameterMap;
    var productID;
    var prod;
    var methods = {};
    var address = {};

    address.city = parameterMap.city.value;
    address.stateCode = parameterMap.stateCode.value;
    address.postalCode = parameterMap.postalCode.value;
    address.countryCode = parameterMap.countryCode.value;
    address.address1 = parameterMap.address1.value;

    productID = parameterMap.pid.value;
    prod = ProductMgr.getProduct(productID);

    shippingMethods = ShippingMgr.getProductShippingModel(prod).getApplicableShippingMethods();
    var estDate = zenkraft.getEstimatedDeliveryDates(address);

    shipMethods = collections.map(shippingMethods, function (shippingMethod) {
        var modelMethod = new ShippingMethodModel(shippingMethod);
        var filterMethod = ZenkraftHelper.filterShippingMethodsForEstimatedDate(modelMethod, estDate.rates);
        return filterMethod;
    });

    methods.shipMethods = shipMethods;

    res.json(methods);
    return next();
});

/**
 * Query Return Cases
 *
 * @param {String} request.httpParameterMap.query
 * The search can be configured using a simple query language,
 * which provides most common filter and operator functionality.
 *
 * Documentation: https://documentation.b2c.commercecloud.salesforce.com/DOC2/index.jsp?topic=%2Fcom.demandware.dochelp%2FDWAPI%2Fscriptapi%2Fhtml%2Fapi%2Fclass_dw_object_CustomObjectMgr.html&resultof=%22%43%75%73%74%6f%6d%4f%62%6a%65%63%74%4d%67%72%22%20%22%63%75%73%74%6f%6d%6f%62%6a%65%63%74%6d%67%72%22%20&anchor=dw_object_CustomObjectMgr_queryCustomObjects_String_String_String_Object_DetailAnchor
 * Examles: custom.carrier = 'fedex', custom.processed != Null
 *
 * @returns {Array} ressponse.data - array objects to export
 */
server.post('GetReturnCases', zenkraftMiddleware.customOcapiAuth, function (req, res, next) {
    var body = request.httpParameterMap;

    if (body.query.empty) {
        res.json({
            error: true,
            msg: 'You request should include query',
            documentation: 'https://documentation.b2c.commercecloud.salesforce.com/DOC2/index.jsp?topic=%2Fcom.demandware.dochelp%2FDWAPI%2Fscriptapi%2Fhtml%2Fapi%2Fclass_dw_object_CustomObjectMgr.html&resultof=%22%43%75%73%74%6f%6d%4f%62%6a%65%63%74%4d%67%72%22%20%22%63%75%73%74%6f%6d%6f%62%6a%65%63%74%6d%67%72%22%20&anchor=dw_object_CustomObjectMgr_queryCustomObjects_String_String_String_Object_DetailAnchor'
        });
        return next();
    }
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var unExportedReturnCases = CustomObjectMgr.queryCustomObjects("zenkraftReturn", body.query, null, null).asList();
    var exportZenkraftObjects = ZenkraftHelper.generateZenkraftExportData(unExportedReturnCases);

    res.json({data: exportZenkraftObjects});
    return next();
});

/**
 * Update processed date of the Return Case.
 *
 * @param {String} request.httpParameterMap.requestBodyAsString
 * Must contains array of 'orderTrackNo'
 */
server.post('SetReturnCasesProcessedDate', zenkraftMiddleware.customOcapiAuth, function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');
    var date = new Date();
    var orderTrackNos = [];
    try {
        data = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
    } catch (e) {
        res.json({ error: 'Wrong request' });
        return next();
    }
    for (var i = 0; i < data.orderTrackNo.length; i++) {
        var orderTrackNo = data.orderTrackNo[i];
        orderTrackNos.push(orderTrackNo);
        Transaction.wrap(function () {
            var zenkraftObject = CustomObjectMgr.getCustomObject('zenkraftReturn', orderTrackNo);
            zenkraftObject.custom.processed = date
        });
    }
    res.json({
        msg: 'success',
        orderTrackNos: orderTrackNos
    });
    return next();
});

module.exports = server.exports();
