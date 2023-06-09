/* global dw, empty, session */
/**
* Model for working with the Zenkraft API
*
* @module cartridge/scripts/zenkraft
*/

'use strict';

var dwsvc = require('dw/svc');
var Site = require('dw/system/Site');
var HashMap = require('dw/util/HashMap');

var configureZenkraftService = function configureService(serviceID, serviceRequest) {
    var service = dwsvc.LocalServiceRegistry.createService(serviceID, {
        createRequest: function (svc, request) {

			// Get API key from site preference in the Zenkraft custom site preference group
            var zenkraftkey = Site.getCurrent().getCustomPreferenceValue('zenkraftMasterAPIKey');

            svc.addHeader('zkkey', zenkraftkey);
            svc.addHeader('Accept', 'application/json');
            svc.setRequestMethod('POST');
            svc.addHeader('Content-Type', 'application/json');

            return !empty(request) ? request : {};
        },

        parseResponse: function (svc, client) {
            var data = client.text;

            data = JSON.parse(data);

            return data;
        },

        getRequestLogMessage: function logTrackRequest() {
            var msg = '';

            return msg;
        },

        getResponseLogMessage: function logTrackResponse() {
            var msg = '';

        // filtered out. see Zenkraft API console for secure responses.
            return msg;
        }
    });
    return service.call(serviceRequest);
};

/**
* Create the object that will be passed in the /rates API call
*
* @param {Object} address recipient
* @param {Object} items items being shipped
* @return {Object} JSON Object of Request Data
*/
var getShippingRateRequest = function getRateReqeustData(address, items) {
    var req = {};
    var sender = {};
    var recipient = {};
    var packages = [];
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
  // eslint-disable-next-line max-len
    var prefs = ZenkraftHelper.prepareZenkraftDataConfiguration('SHIP', address.countryCode.value.toUpperCase());
    var productLineItems;
  // build shipment
    req.shipment = {};
    req.shipment.test = prefs.IS_TEST;
    req.shipment.debug = prefs.IS_DEBUG;
    req.shipment.carrier = prefs.CARRIER;
    req.shipment.type = 'outbound';
    req.shipment.dim_units = prefs.DIM_UNITS;
    req.shipment.weight_units = prefs.WEIGHT_UNITS;
    req.shipment.currency = prefs.CURRENCY;
    req.shipment.packaging = prefs.PACKAGING;
    req.shipment.shipping_account = prefs.SHIP_ACCOUNT;

  // build sender data
    sender.street1 = prefs.SENDER_STREET;
    sender.city = prefs.SENDER_CITY;
    sender.state = prefs.SENDER_STATE;
    sender.postal_code = prefs.SENDER_POSTAL;
    sender.country = prefs.SENDER_COUNTRY;
    req.shipment.sender = sender;

  // build recipient data from user address
    recipient.street1 = !empty(address.address1) ? address.address1 : '';
  // eslint-disable-next-line max-len
    recipient.city = !empty(address.city) ? address.city : '';
  // eslint-disable-next-line max-len
    recipient.state = !empty(address.stateCode) && address.stateCode !== 'undefined' ? address.stateCode : '';
    recipient.postal_code = !empty(address.postalCode) ? address.postalCode : '';
    recipient.country = !empty(address.countryCode) ? address.countryCode.value.toUpperCase() : '';
    req.shipment.recipient = recipient;

  // build packages using current cart
    productLineItems = items.items;

    productLineItems.forEach(function addProductLines(item) {
        var productLineItem = item;

        var singlepackage = {
            weight: !empty(productLineItem.dimWeight) ? productLineItem.dimWeight : 1,
            value: 1,
            length: !empty(productLineItem.length) ? productLineItem.length : 1,
            width: !empty(productLineItem.dimWidth) ? productLineItem.dimWidth : 1,
            height: !empty(productLineItem.dimHeight) ? productLineItem.dimHeight : 1
        };

        packages.push(singlepackage);
    });

    req.shipment.packages = packages;

    return req;
};

/**
* Create the object that will be passed in the /rates API call
* for the PDP estimated date
* @param {Object} address Address for the lookup
* @return {Object} JSON Object of Request Data
*/
var getShippingRatePDPRequest = function (address) {
    var req = {};
    var sender = {};
    var recipient = {};
    var packages = [];
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var prefs = ZenkraftHelper.prepareZenkraftDataConfiguration('SHIP', address.countryCode.toUpperCase());

	// build shipment
    req.shipment = {};
    req.shipment.test = prefs.IS_TEST;
    req.shipment.debug = prefs.IS_DEBUG;
    req.shipment.carrier = prefs.CARRIER;
    req.shipment.type = 'outbound';
    req.shipment.dim_units = prefs.DIM_UNITS;
    req.shipment.weight_units = prefs.WEIGHT_UNITS;
    req.shipment.currency = prefs.CURRENCY;
    req.shipment.packaging = prefs.PACKAGING;
    req.shipment.shipping_account = prefs.SHIP_ACCOUNT;

	// build sender data
    sender.street1 = prefs.SENDER_STREET;
    sender.city = prefs.SENDER_CITY;
    sender.state = prefs.SENDER_STATE;
    sender.postal_code = prefs.SENDER_POSTAL;
    sender.country = prefs.SENDER_COUNTRY;
    req.shipment.sender = sender;

	// build recipient data from user address
    recipient.street1 = !empty(address.address1) ? address.address1 : '';
    recipient.city = !empty(address.city) ? address.city : '';
    recipient.state = !empty(address.stateCode) && address.stateCode !== 'undefined' ? address.stateCode : '';
    recipient.postal_code = !empty(address.postalCode) ? address.postalCode : '';
    recipient.country = !empty(address.countryCode) ? address.countryCode.toUpperCase() : '';
    req.shipment.recipient = recipient;

	// build packages using current cart
    var pack = {
        weight: 1,
        value: 1,
        length: 1,
        width: 1,
        height: 1
    };

    packages.push(pack);

    req.shipment.packages = packages;

    return req;
};

/**
* Create the object that will be passed in the /ship API call
* @param {Object} order sfcc order
* @param {string} type type of request, ex: outbound
* @param {Object} products products being shipped
* @return {Object} JSON Object of Request Data
*/
var getShippingLabelRequest = function getLabelRequestData(order, type, products) {
    var req = {};
    var sender = {};
    var recipient = {};
    var packages = [];
    var references = [];
    var prefs;
    var shipservice;
    var defShipment = order.getDefaultShipment();
    var address = defShipment.shippingAddress;
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var productLineItems;
    var pli;
    var pliItem;
    var quantity;
    var reference;
    var i;
    var singlepackage = {};

    var dateString = y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);

  // Get appropriate preferences and shipping service for the situation
    if (type === 'outbound') {
    // eslint-disable-next-line max-len
        prefs = ZenkraftHelper.prepareZenkraftDataConfiguration('SHIP', address.countryCode.toUpperCase());
        shipservice = defShipment.shippingMethod.custom.zenkraftID;
    } else {
    // eslint-disable-next-line max-len=
        prefs = ZenkraftHelper.prepareZenkraftDataConfiguration('RETURN', address.countryCode.value.toUpperCase());
        shipservice = prefs.SHIPPING_SERVICE;
    }

  // build shipment
    req.shipment = {};
    req.shipment.test = prefs.IS_TEST;
    req.shipment.debug = prefs.IS_DEBUG;
    req.shipment.carrier = prefs.CARRIER;
    req.shipment.service = shipservice;
    req.shipment.ship_date = dateString;
    req.shipment.type = !empty(type) ? type : 'return';
    req.shipment.packaging = prefs.PACKAGING;
    req.shipment.dim_units = prefs.DIM_UNITS;
    req.shipment.weight_units = prefs.WEIGHT_UNITS;
    req.shipment.currency = prefs.CURRENCY;
    req.shipment.shipping_account = prefs.SHIP_ACCOUNT;
    req.shipment.label_type = prefs.LABEL_TYPE;
    req.shipment.include_base64_label = true;

  // build recipient data
    recipient.email = prefs.SENDER_EMAIL;
    recipient.street1 = prefs.SENDER_STREET;
    recipient.company = !empty(prefs.SENDER_COMPANY) ? prefs.SENDER_COMPANY : '';
    recipient.phone = !empty(prefs.SENDER_PHONE) ? prefs.SENDER_PHONE : '1234567890';
    recipient.city = prefs.SENDER_CITY;
    recipient.state = prefs.SENDER_STATE;
    recipient.postal_code = prefs.SENDER_POSTAL;
    recipient.country = !empty(prefs.SENDER_COUNTRY) ? prefs.SENDER_COUNTRY.toUpperCase() : 'US';
    recipient.name = !empty(prefs.SENDER_NAME) ? prefs.SENDER_NAME : '';

  // build sender data from order address
    sender.street1 = !empty(address.address1) ? address.address1 : '';
    sender.city = !empty(address.city) ? address.city : '';
    sender.state = !empty(address.stateCode) ? address.stateCode : '';
    sender.postal_code = !empty(address.postalCode) ? address.postalCode.replace(/\s+/g, '') : '';
    sender.country = !empty(address.countryCode) ? address.countryCode.value.toUpperCase() : '';
    sender.company = 'Zenkraft User';
    sender.name = !empty(address.fullName) ? address.fullName : '';
    sender.phone = !empty(address.phone) ? address.phone : '1234567890';
    sender.email = !empty(order.customerEmail) ? order.customerEmail : '';

  // If the type is a new outbound shipment,
  // then the recipient is the customer and the sender is the site
  // However, if it's a return, then we are the recipient and the customer is the sender
    if (type === 'outbound') {
        req.shipment.recipient = sender;
        req.shipment.sender = recipient;
    } else {
        req.shipment.recipient = recipient;
        req.shipment.sender = sender;
    }

  // build packages using current cart
    productLineItems = order.getAllProductLineItems().iterator();

  // If the type of request is a return, then use specific products.
  // If it's an outbound request, use all of the products on the order
    if (type === 'return') {
        while (productLineItems.hasNext()) {
            pli = productLineItems.next();
            pliItem = pli.product;

      // only use the products that the user selected
            if (!empty(pliItem)) {
        // eslint-disable-next-line no-prototype-builtins
                if (products.hasOwnProperty(pliItem.ID)) {
                    quantity = products[pliItem.ID];

                    for (i = 0; i < quantity; i++) {
                        singlepackage = {
                            weight: !empty(pliItem.custom.dimWeight) ? pliItem.custom.dimWeight : 1,
                            value: 1,
                            length: !empty(pliItem.custom.length) ? pliItem.custom.length : 1,
                            width: !empty(pliItem.custom.dimWidth) ? pliItem.custom.dimWidth : 1,
                            height: !empty(pliItem.custom.dimHeight) ? pliItem.custom.dimHeight : 1
                        };

                        packages.push(singlepackage);
                    }
                }
            }
        }
        req.shipment.packages = packages;
    } else {
        while (productLineItems.hasNext()) {
            pli = productLineItems.next();
            pliItem = pli.product;
            quantity = pli.quantityValue;

            for (i = 0; i < quantity; i++) {
                singlepackage = {
                    weight: !empty(pliItem.custom.dimWeight) ? pliItem.custom.dimWeight : 1,
                    value: 1,
                    length: !empty(pliItem.custom.length) ? pliItem.custom.length : 1,
                    width: !empty(pliItem.custom.dimWidth) ? pliItem.custom.dimWidth : 1,
                    height: !empty(pliItem.custom.dimHeight) ? pliItem.custom.dimHeight : 1
                };

                packages.push(singlepackage);
            }
        }

        req.shipment.packages = packages;
    }

    if (prefs.CARRIER === 'dhl') {
        reference = {
            type: 'ref',
            value: order.orderNo
        };
    } else {
        reference = {
            type: 'invoice_number',
            value: order.orderNo
        };
    }

    references.push(reference);

    req.shipment.references = references;

    return req;
};

/**
* Cleans up Zenkraft shipping rates response
* to make it easier to compare with SFCC Shipping Methods.
* Also sets session variable for shipping costs to be used during cart calculation.
*
* @param {Object} data shipping data object
* @return {HashMap} JSON Object of Sanitized Shipping Method Data
*/
var sanitizeShippingData = function cleanShippingData(data) {
    var zendata;
    var cleanMethods = [];
    var zenkraftCosts = {};

    zendata = data.rates;

  // Create a new object with all of the Zenkraft carrier data
    zendata.forEach(function updateMethodsWithDate(meth) {
        var cleanmethod = {};
        var realTimeRates = require('~/cartridge/scripts/realTimeRates');

        cleanmethod.cost = !empty(meth.total_cost) && Site.getCurrent().getCustomPreferenceValue('enableZenkraftShippingRates') ? meth.total_cost : null;
        cleanmethod.estimated_date = !empty(meth.estimated_date) ? meth.estimated_date : '';
        cleanmethod.service_type = meth.service_type;

        cleanMethods.push(cleanmethod);
        zenkraftCosts[meth.service_type] = cleanmethod.cost;

        // set the session variable for later use in cart calculation
        if (!empty(zenkraftCosts)) {
            realTimeRates.updateSessionShippingRates(JSON.stringify(zenkraftCosts));
        } else if (!empty(session.privacy.zenkraftCosts)) {
            realTimeRates.updateSessionShippingRates();
        }
    });

    return cleanMethods;
};

/**
* Get Shipping Data From Zenkraft Web Service
*
* @param {Object} address shipping address
* @param {Object} cart sfcc basket object
* @param {Object} methods available shipping methods
* @return {HashMap} JSON Object of Available Shipping Method Data
*/
var getShippingData = function getShipData(address, cart, methods, date) {
  // eslint-disable-next-line no-unused-vars
    var resp = {};
    var cleanresp = new HashMap();
    var realTimeRates = require('~/cartridge/scripts/realTimeRates');

    if (!empty(address) && !empty(address.postalCode)) {
        var reqdata = getShippingRateRequest(address, cart);
        if (!empty(reqdata.shipment) && !empty(date)) {
            reqdata.shipment.ship_date = date;
        }
        resp = configureZenkraftService('http.zenkraft.rate', JSON.stringify(reqdata));

        if (!empty(resp.object) && !empty(resp.object.rates)) {
            // successful rate response
            cleanresp = sanitizeShippingData(resp.object, methods);
        } else {
            // error returned from zenkfraft service. Reset costs in the session
            // eslint-disable-next-line no-lonely-if
            if (!empty(session.privacy.zenkraftCosts)) {
                realTimeRates.updateSessionShippingRates();
            }
        }
    } else {
        realTimeRates.updateSessionShippingRates();
    }
    return cleanresp;
};

/**
* Get Shipping Label From Zenkraft Web Service
*
* @param {Object} order sfcc order object
* @param {Object} products products in shipment
* @param {string} emailaddress optional; email address to send label to
* @return {HashMap} JSON Object of Available Shipping Method Data
*/
var getShippingLabel = function getShipLabel(order, products, emailaddress) {
    var resp;
    var req = {};
    var emailHelper = require('*/cartridge/scripts/helpers/emailHelpers');
    var Resource = require('dw/web/Resource');

    req = getShippingLabelRequest(order, 'return', products);
    resp = configureZenkraftService('http.zenkraft.ship', JSON.stringify(req));

  // Send the email if applicable
    if (!empty(emailaddress)) {
        if (!empty(resp.object)) {
            if (empty(resp.object.error)) {
                var emailObj = {
                    to: emailaddress,
                    subject: Resource.msg('labelemail.arrived', 'order', null),
                    from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
                };

                var labelObj = {
                    LabelURL: resp.object.shipment.packages[0].label
                };

                emailHelper.sendEmail(emailObj, 'mail/printLabelEmail', labelObj);
            }
        }
    }

    return resp.object;
};

/**
* Get Tracking Information For a Shipment
*
* @param {string} trackingNo tracking number for shipment
* @param {string} carrier carrier ID
* @return {HashMap} JSON Object with the shipping information including tracking number and label URL
*/
var getTrackingInfo = function getTracking(trackingNo, carrier) {
    var resp;
    var req;
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var prefs = ZenkraftHelper.getTrackingJSONPreferences(carrier);
    var retObject = {};

    // ADD debug and test preferences
    req = {
        track: {
            debug: prefs.IS_DEBUG == "true" ? true : false,
            test: prefs.IS_TEST == "true" ? true : false,
            shipping_account: prefs.SHIPPING_ACCOUNT,
            carrier: carrier,
            tracking_number: trackingNo
        }
    };

    resp = configureZenkraftService('http.zenkraft.track', JSON.stringify(req));

    if (!empty(resp.object)) {
        if (empty(resp.object.error)) {
            retObject = resp.object;
        } else {
            retObject = resp.object;
        }
    } else {
        return {
            error: 'Error Getting Tracking Information'
        };
    }

    return retObject;
};

/**
* Get Drop Off Locations using the Zenkraft Web Service
*
* @param {Object} shipaddress shipping address
* @return {HashMap} JSON Object with the location information
*/
var getDropOffLocations = function getDPLocations(shipaddress) {
    var ZenkraftHelper = require('~/cartridge/scripts/helpers/zenkraftHelper');
    var prefs = ZenkraftHelper.prepareZenkraftDataConfiguration('RETURN', shipaddress.countryCode.value.toUpperCase());
    var resp;
    var req;
    var thisaddress = shipaddress;

    if (!empty(thisaddress) && !empty(thisaddress.postalCode)) {
		// req = address;
        req = {
            dopu:
            {
                carrier: prefs.CARRIER,
                location: {
                    city: !empty(thisaddress.city) ? thisaddress.city : '',
                    country: !empty(thisaddress.countryCode) ? thisaddress.countryCode.value.toUpperCase() : '',
                    postal_code: !empty(thisaddress.postalCode) ? thisaddress.postalCode.toString() : '',
                    state: !empty(thisaddress.stateCode) && thisaddress.stateCode !== 'undefined' ? thisaddress.stateCode : '',
                    street1: !empty(thisaddress.address1) ? thisaddress.address1 : ''
                },
                packaging: prefs.PACKAGING,
                shipping_account: prefs.SHIP_ACCOUNT,
                test: prefs.IS_TEST,
                debug: prefs.IS_DEBUG
            }
        };
        resp = configureZenkraftService('http.zenkraft.dopu', JSON.stringify(req));

        if (!empty(resp.object)) {
            if (empty(resp.object.error)) {
                return resp.object;
            }
            return resp.object;
        }
        return {
            error: 'No Locations Available'
        };
    }

    return {};
};

/**
* Get Earliest Delivery Date for a given address
*
* @param {Object} address Address to be used
* @return {HashMap} JSON Object with the location information
*/
var getEstimatedDeliveryDates = function (address) {
    var resp = {};

    if (!empty(address) && !empty(address.postalCode)) {
        var reqdata = getShippingRatePDPRequest(address);
        resp = configureZenkraftService('http.zenkraft.rate', JSON.stringify(reqdata));
    }

	// formattedDate = ZenkraftHelper.getFormattedDateTime(resp.object);
    return resp.object;
};

/**
* Filter categories
*
* @param {Product} product class
* @return {string} comma separated categories of product
*/
function getProductCategories(product) {
    var thisProduct = null;
    if (product.isCategorized()) {
        thisProduct = product;
    } else {
        thisProduct = product.getMasterProduct();
    }
    var categories = thisProduct.getAllCategories().toArray();
    var categoryIDs = [];
    categories.forEach(function (category) {
        categoryIDs.push(category.ID);
    });
    var uniqueCategories = categoryIDs.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
    return uniqueCategories.join(', ');
}

/**
* Prepare return lines for Zenkraft Return Sync
*
* @param {Array} orderLineItems ProductLineItems
* @param {Array} items return items
* @return {Array} objects
*/
function getReturnLines(orderLineItems, items) {
    var returnLines = [];
    orderLineItems.forEach(function (lineItem) {
        items.forEach(function (item) {
            if (lineItem.product.getID() === item.productID) {
                var product = lineItem.getProduct();
                var imageURL = product.getImage('medium').getURL().abs().toString();
                returnLines.push({
                    line_id: lineItem.getUUID(),
                    quantity: lineItem.getQuantityValue(),
                    unit_price: lineItem.getPriceValue(),
                    currency: lineItem.getAdjustedGrossPrice().getCurrencyCode(),
                    reason: {
                        level1_code: item.reasonCode,
                        level1_text: item.reasonCode.replace(/-|_/g, ' '),
                        level2_code: item.subReasonCode,
                        level2_text: item.subReasonCode.replace(/-|_/g, ' ')
                    },
                    product: {
                        product_id: product.isMaster() ? product.getID() : product.getMasterProduct().getID(),
                        product_name: product.isMaster() ? product.getName() : product.getMasterProduct().getName(),
                        product_category: getProductCategories(product),
                        description: product.getPageDescription(),
                        variant_id: product.getID(),
                        variant_name: product.getName(),
                        image_url: imageURL.indexOf('http') !== -1 ? imageURL : ''
                    },
                    approval_required: Site.getCurrent().getCustomPreferenceValue('enableZenkraftReturnsApproval')
                });
            }
        });
    });
    return returnLines;
}

/**
* Send request to Zenraft Return Sync service
*
* @param {Object} req Zenkraft sync object request
* @return {Object} resp Zenkraft sync object response
*/
function sendSyncReturnWithZenkraft(req) {
    var Logger = require('dw/system/Logger');
    var resp = {};

    resp = configureZenkraftService('http.zenkraft.return', JSON.stringify(req));
    if (!empty(resp.object) && empty(resp.object.error)) {
        return resp;
    }

    return Logger.error("Zenkraft Error: Response: " + resp.object.error.message);
}

/**
* Prepare Zenraft Return Sync request
*
* @param {Object} req Zenkraft sync object request
* @return {void}
*/
function getSyncReturnRequest(label, order, items, returnID) {
    var zenkraftShipment = label.shipment;
    var returnLines = getReturnLines(order.getProductLineItems().toArray(), items);
    var req = {
        return: {
            return : {
                return_id : returnID
            },
			order: {
                order_id: order.getOrderNo()
            },
            customer: {
                customer_id: order.getCustomerNo() ? order.getCustomerNo() : order.getCustomer().getID()
            },
            return_lines: returnLines,
            return_from: zenkraftShipment.sender,
            return_to: zenkraftShipment.recipient
        }
    };
    sendSyncReturnWithZenkraft(req);
}

/* Exports of the module */
// /**
//* @see {@link module:cartridge/scripts/zenkraft~MyFunction} */
exports.getShippingData = getShippingData;
exports.getShippingLabel = getShippingLabel;
exports.getTrackingInfo = getTrackingInfo;
exports.getDropOffLocations = getDropOffLocations;
exports.getEstimatedDeliveryDates = getEstimatedDeliveryDates;
exports.getSyncReturnRequest = getSyncReturnRequest;
