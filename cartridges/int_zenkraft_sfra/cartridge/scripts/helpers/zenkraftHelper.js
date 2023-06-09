/* global dw, empty, session */
'use strict';

var Logger = require('dw/system/Logger');

/**
* Convert YYYY-MM-DD date string to SFCC date
*
* @return {date}
*/
function convertDate(dateString) {
    var dateSlice = dateString.slice(0, dateString.lastIndexOf('-') + 3)
    var dateArray = dateSlice.split('-');
    return new Date(dateArray[0], dateArray[1], dateArray[2]);
}

/**
* Convert YYYY-MM-DD HH:MM:SS date string to SFCC date and time
*
* @return {date}
*/
function convertTime(dateString) {
    var date = convertDate(dateString);
    var timeSlice = dateString.slice(dateString.indexOf(':') - 2, dateString.lastIndexOf(':') + 3);
    var timeArray = timeSlice.split(':');
    date.setHours(timeArray[0]);
    date.setMinutes(timeArray[1]);
    date.setSeconds(timeArray[2]);
    return date;
}

/**
* Returns the higher lead time of the current basket
*
* @param {Basket} currentBasket
*
* @return {integer} leadTime
*/
var getLeadTime = function filterleadTime() {
    var Site = require('dw/system/Site');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var leadTime = Site.getCurrent().getCustomPreferenceValue('companyWideLeadTime');
    if (!currentBasket) {
        return leadTime;
    }
    var productCategoryTime = 0;
    // TODO - add the product leadTime to the leadTime
    var productLineItemsArray = currentBasket.getProductLineItems().toArray();
    if (!empty(productLineItemsArray)) {
        productLineItemsArray.forEach(function (productLineItem) {
            var category = productLineItem.getCategory();
            var product = productLineItem.getProduct();
            if (product.isVariant()) {
                product = product.getMasterProduct();
            }
            if (category && category.getCustom().leadTime && !empty(category.getCustom().leadTime) && category.getCustom().leadTime > leadTime) {
                productCategoryTime = category.getCustom().leadTime;
            }
            if (product && product.getCustom().leadTime && !empty(product.getCustom().leadTime) && product.getCustom().leadTime > leadTime) {
                productCategoryTime = product.getCustom().leadTime;
            }
        });
    }
    if (productCategoryTime > 0) {
        leadTime += productCategoryTime;
    }
    return leadTime;
}

/**
* Returns a date/time string formatted for the public tracking page
*
* @param {Date} date date/time to format
*
* @return {string} Formatted date/time
*/
var getFormattedDateTime = function formatDateTime(date) {
    var thisDate = date;
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // eslint-disable-next-line no-unused-vars, max-len
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var thisTomorrow = new Date();
  // eslint-disable-next-line max-len
    var formattedDate = days[thisDate.getDay()] + ' - ' + months[thisDate.getMonth()] + ' ' + thisDate.getDate();
    thisTomorrow.setDate(thisTomorrow.getDate() + 1);

  // return Tomorrow if date is tomorrow
    if (thisDate.getDate() === thisTomorrow.getDate()) {
        formattedDate = 'Tomorrow';
    }

    return formattedDate;
};

var filterShippingMethodsForEstimatedDate = function formatShipMethods(method, objdates) {
    var thisMethod = method;
    var thisDates = objdates;
    var RealTimeRates = require('~/cartridge/scripts/realTimeRates');
    var Site = require('dw/system/Site');
    var Money = require('dw/value/Money');
    var formatCurrency = require('*/cartridge/scripts/util/formatting').formatCurrency;
    var methodCost;
    var methodCostMoney;

    var filteredmethod = thisDates.filter(function filterMethod(thisDate) {
        return thisDate.service_type === thisMethod.zenkraftID;
    });

    var thisEstimateobj = filteredmethod[0];

    if (!empty(thisEstimateobj) && !empty(thisEstimateobj.estimated_date)) {
        var parts = thisEstimateobj.estimated_date.split('-'); // eslint-disable-line vars-on-top
        var thisDateraw = new Date(parts[0], parts[1] - 1, parts[2]); // eslint-disable-line vars-on-top

        thisMethod.totalCost = thisEstimateobj.total_cost;
        thisMethod.currency = thisEstimateobj.currency;
        thisMethod.estimatedArrivalTime = getFormattedDateTime(thisDateraw);
    }

    // if real time rates are enabled for the site, replace the SFCC cost with
    // the rate from the Zenkraft API
    if (!empty(thisEstimateobj) && !empty(thisEstimateobj.cost) && Site.getCurrent().getCustomPreferenceValue('enableZenkraftShippingRates')) {

        // add markup to real time rates
        // add any markups
        var markupType = thisMethod.zenkraftRateMarkupType.value;
        var markup = thisMethod.zenkraftRateMarkup;

        methodCostMoney = new Money(thisEstimateobj.cost, session.currency.currencyCode);

        methodCost = RealTimeRates.getMarkupCost(markupType, markup, methodCostMoney);
        methodCost = formatCurrency(methodCost.value, session.currency.currencyCode);
        thisMethod.shippingCost = methodCost;
    }

    return thisMethod;
};

/**
* Retrieves object with preferences for Zenkraft. The data is retrieved from the
* Advanced JSON Configuration Object or Zenkraft Default preferences group
*
* @param {string} type of preference: SHIP/RETURN
* @param {string} countrycode Code for 'Ship to' Address
*
* @return {Object} JSON Object of Site Preference Values
*/
var prepareZenkraftDataConfiguration = function getConfigurationFromPreferences (type, countrycode) {
    var Site = require('dw/system/Site');
    var advJson = {};
    var advJsonSpec = {};
    var iszenkraftAdvancedJSONOn = Site.getCurrent().getCustomPreferenceValue('zenkraftAdvancedJSON');
    var isSetUp = (iszenkraftAdvancedJSONOn && !empty(type) && !empty(countrycode))
    if (isSetUp) {
        try {
            advJson = JSON.parse(Site.getCurrent().getCustomPreferenceValue('zenkraftAdvancedJSONObject'));
            advJsonSpec = advJson[type][countrycode];
        } catch (e) {
            Logger.error('Invalid Zenkraft Advanced JSON object');
            return {};
        }
    }
    return {
        /*eslint-disable */
        IS_TEST: !(Site.getCurrent().getCustomPreferenceValue('zenkraftProdMode')),
        IS_DEBUG: Site.getCurrent().getCustomPreferenceValue('zenkraftDebugLog'),
        CARRIER: advJsonSpec.hasOwnProperty('CARRIER_ID') ? advJsonSpec['CARRIER_ID'] : Site.getCurrent().getCustomPreferenceValue('zenkraftCarrier'),
        SHIPPING_SERVICE: advJsonSpec.hasOwnProperty("SERVICE_TYPE") ? advJsonSpec['SERVICE_TYPE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftShippingService'),
        PACKAGING: advJsonSpec.hasOwnProperty("PACKAGING") ? advJsonSpec['PACKAGING'] : Site.getCurrent().getCustomPreferenceValue('zenkraftPackagingType'),
        DIM_UNITS: advJsonSpec.hasOwnProperty("DIM_UNITS") ? advJsonSpec['DIM_UNITS'] : Site.getCurrent().getCustomPreferenceValue('zenkraftDimensionUnits').value,
        WEIGHT_UNITS: advJsonSpec.hasOwnProperty("WEIGHT_UNITS") ? advJsonSpec['WEIGHT_UNITS'] : Site.getCurrent().getCustomPreferenceValue('zenkraftWeightUnits').value,
        DEFAULT_WEIGHT: Site.getCurrent().getCustomPreferenceValue('zenkraftDefaultProductWeight'),
        CURRENCY: advJsonSpec.hasOwnProperty("CURRENCYCODE") ? advJsonSpec['CURRENCYCODE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftCurrencyCode'),
        SHIP_ACCOUNT: advJsonSpec.hasOwnProperty("ACCOUNT_ID") ? advJsonSpec['ACCOUNT_ID'] : Site.getCurrent().getCustomPreferenceValue('zenkraftShippingAccount'),
        SENDER_EMAIL: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['EMAIL'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderEmail'),
        SENDER_NAME: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['NAME'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderName'),
        SENDER_COMPANY: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['COMPANY'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCompany'),
        SENDER_STREET: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['STREET'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderStreet'),
        SENDER_CITY: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['CITY'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCity'),
        SENDER_STATE: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['STATECODE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderStateCode'),
    // eslint-disable-next-line max-len
        SENDER_POSTAL: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['POSTALCODE'].replace(/\s+/g, '') : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderPostalCode').replace(/\s+/g, ''),
        SENDER_COUNTRY: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['COUNTRYCODE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderCountryCode'),
        SENDER_PHONE: advJsonSpec.hasOwnProperty("ADDRESS") ? advJsonSpec['ADDRESS']['PHONE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftSenderPhone'),
        LABEL_TYPE: advJsonSpec.hasOwnProperty("FILETYPE") ? advJsonSpec['FILETYPE'] : Site.getCurrent().getCustomPreferenceValue('zenkraftShipLabelFileType')
         /*eslint-enable */
    }
}

/**
* Retrieves object with shipping accounts by carrier.
*
* @param {string} carrier (ups, fedex, usps, etc)
*
* @return {Object} JSON Object of shipment account settings
*/
var getTrackingJSONPreferences = function trackingJsonPrefs(carrier) {
    var Site = require('dw/system/Site');
  // eslint-disable-next-line max-len
    var advJsonRaw = Site.getCurrent().getCustomPreferenceValue('zenkraftTrackingAccountSettingsJSON');
    var advJson;
    var returnObj = {};
    var advJsonSpec = {};

    try {
    // parse our object
        advJson = JSON.parse(advJsonRaw);

    // get the data for the carrier
        advJsonSpec = advJson[carrier];

    // set our return object
    // eslint-disable-next-line no-prototype-builtins
        returnObj.IS_TEST = advJsonSpec.hasOwnProperty('DEBUG') ? advJsonSpec.DEBUG : !(Site.getCurrent().getCustomPreferenceValue('zenkraftProdMode'));
        // eslint-disable-next-line no-prototype-builtins
        returnObj.IS_DEBUG = advJsonSpec.hasOwnProperty('DEBUG') ? advJsonSpec.DEBUG : Site.getCurrent().getCustomPreferenceValue('zenkraftDebugLog');
    // eslint-disable-next-line dot-notation, no-prototype-builtins, max-len
        returnObj.SHIPPING_ACCOUNT = advJsonSpec.hasOwnProperty('SHIPPING_ACCOUNT') ? advJsonSpec['SHIPPING_ACCOUNT'] : '';
    } catch (e) {
        Logger.error('Invalid Zenkraft Advanced JSON object');
        return {};
    }

    return returnObj;
};

/**
* Returns a date/time string formatted for the public tracking page
* from an ISO String
*
* @param {string} s ISO String
*
* @return {string} Formatted date/time
*/
var parseISOString = function parseISOString(s) {
    var b = s.split(/\D+/);
    var thisdate;
    var formattedDate;
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    thisdate = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));

    formattedDate = days[thisdate.getDay()] + ', ' + months[thisdate.getMonth()] + ' ' + thisdate.getDate() + ' ' + thisdate.getYear();

    return formattedDate;
};

/**
* Stores the label as a custom object
*
* @param {string} orderNo Order number
* @param {Object} label label info
* @param {Object} items return items
* @return {boolean} true if object was saved, false on any error
*/
var saveReturnLabel = function saveReturn(orderNo, label, items) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');

    var shipment = label.shipment;
    var trackingNumber = shipment.tracking_number;
    var date = new Date();
    var returnID = date.getTime().toString();

    var returnLineItemsIDs = [];
    // TODO - fix zenkraftReturn and zenkraftReturnLineItem as in SiteGen
    Transaction.wrap(function createCOForLabel() {
        var zenkraftReturn = CustomObjectMgr.createCustomObject('zenkraftReturn', returnID);
        zenkraftReturn.custom.orderNumber = orderNo;
        zenkraftReturn.custom.labelType = shipment.label_type;
        // Record all labels
        zenkraftReturn.custom.allLabels = shipment.packages.map(function (packageItem) { return packageItem.label; }).join(',');
        items.forEach(function (item) {
            var returnLineItemID = item.productID + '-' + trackingNumber;
            var returnLineItem = CustomObjectMgr.createCustomObject('zenkraftReturnLineItem', item.orderItemID + '-' + returnID);
            returnLineItem.custom.productID = item.productID;
            returnLineItem.custom.carrier = shipment.carrier;
            returnLineItem.custom.label = item.label;
            returnLineItem.custom.reasonCode = item.reasonCode;
            returnLineItem.custom.subReasonCode = item.subReasonCode;
            returnLineItem.custom.productID = returnID;
            returnLineItem.custom.trackingNumber = trackingNumber;
            returnLineItemsIDs.push(returnLineItemID);
        });
        zenkraftReturn.custom.returnLineItems = returnLineItemsIDs.toString();
    });
    return returnID;
};

var generateZenkraftExportData = function generateData(unExportedReturnCases) {
    var exportZenkraftObjects = [];
    for (var i = 0; i < unExportedReturnCases.length; i++) {
        var val = unExportedReturnCases[i].custom;
        exportZenkraftObjects.push({
            carrier: val.carrier,
            /* labelURL: val.labelURL, */
            orderNumber: val.orderNumber,
            trackingNo: val.trackingNo,
            product: {
/* todo */
            }
        });
    }
    return exportZenkraftObjects;
}

var createUnapprovedZenkraftReturn =function createZenkraftReturn(orderNo, items) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');

    var date = new Date();
    var returnID = date.getTime().toString();

    var returnLineItemsIDs = [];

    Transaction.wrap(function createCOForLabel() {
        var zenkraftReturn = CustomObjectMgr.createCustomObject('zenkraftReturn', returnID);
        zenkraftReturn.custom.orderNumber = orderNo;
        items.forEach(function (item) {
            var returnLineItemID = item.productID + '-' + returnID;
            var returnLineItem = CustomObjectMgr.createCustomObject('zenkraftReturnLineItem', returnLineItemID);
            returnLineItem.custom.productID = item.productID;
            returnLineItem.custom.returnID = returnID;
            returnLineItem.custom.reasonCode = item.reasonCode;
            returnLineItem.custom.subReasonCode = item.subReasonCode;
            returnLineItemsIDs.push(returnLineItemID);
        });
        zenkraftReturn.custom.returnLineItems = returnLineItemsIDs.toString();
    });
    return returnID;
}

var handleShippingMethods = function (viewData) {
    var zenkraft = require('*/cartridge/scripts/zenkraft');
    var ZenkraftEDDHelper = require('~/cartridge/scripts/helpers/zenkraftEDDHelper');
    var thisViewData = viewData; // eslint-disable-line vars-on-top
    var thisAddress = thisViewData.order.shipping[0].shippingAddress; // eslint-disable-line vars-on-top, max-len
    var thisMethods = thisViewData.order.shipping[0].applicableShippingMethods; // eslint-disable-line vars-on-top, max-len
    var thisItems = thisViewData.order.items; // eslint-disable-line vars-on-top
    var thisDates = []; // eslint-disable-line vars-on-top
    var thisMethWithDates = []; // eslint-disable-line vars-on-top
    var date = new Date();
        // if cutoffTime is set via site preference, check to see if current time is after cutoff. If so, add a day
    if (ZenkraftEDDHelper.isAfterCutoffDate()) {
        date.setDate(date.getDate() + 1);
    }
    var leadDate = getLeadTime();
    if (!empty(leadDate)) {
        date.setDate(date.getDate() + leadDate);
    }
    var day = date.getDate().toString();
    var month = (date.getMonth() + 1).toString();
    if (month.length == 1) {
        month = '0' + month;
    }
    var year = date.getFullYear().toString();

    var leadDateFormated = year + '-' + month + '-' + day;

    thisDates = zenkraft.getShippingData(thisAddress, thisItems, thisMethods, leadDateFormated);

// if we get dates back
    if (!empty(thisDates)) { // eslint-disable-line no-undef
        thisMethods.forEach(function filterMethods(method) {
            var thisMethod = filterShippingMethodsForEstimatedDate(method, thisDates); // eslint-disable-line vars-on-top, max-len
            var dopulocations;

            if (thisMethod.dropOffMethod) {
                dopulocations = zenkraft.getDropOffLocations(thisAddress);
                if (dopulocations.locations && dopulocations.locations.length > 0) {
                    thisMethod.displayName = dopulocations.locations[0].company_name;
                    thisMethod.dropOffLocations = dopulocations.locations;
                    thisMethWithDates.push(thisMethod);
                }
            } else {
                thisMethWithDates.push(thisMethod);
            }
        });

        thisViewData.order.shipping[0].applicableShippingMethods = thisMethWithDates;
    }
    return thisViewData;
}

var checkOrderRetrunApproval = function (order) {
    var Site = require('dw/system/Site');
    var customerGroups = order.getCustomer().getCustomerGroups().toArray();
    var productLineItems = order.getProductLineItems().toArray();
    var zenkraftReturnApprovalCatalogCategories = Site.getCurrent().getCustomPreferenceValue('zenkraftReturnApprovalCatalogCategories');
    var zenkraftReturnApprovalCustomerGroups = Site.getCurrent().getCustomPreferenceValue('zenkraftReturnApprovalCustomerGroups');
    var isReturnApprovalRequired = false;
    // check all customer groups that client belongs to
    if (customerGroups.length > 0 && !empty(zenkraftReturnApprovalCustomerGroups)) {
        zenkraftReturnApprovalCustomerGroups = zenkraftReturnApprovalCustomerGroups.split(',');
        customerGroups.forEach(function (customerGroup) {
            var customerGroupID = customerGroup.getID();
            zenkraftReturnApprovalCustomerGroups.forEach(function (preferenceCustomerGroup) {
                if (customerGroupID.toLowerCase() === preferenceCustomerGroup.toLowerCase()) {
                    isReturnApprovalRequired = true;
                    return isReturnApprovalRequired;
                }
            });
        });
    }
    if (productLineItems.length > 0 && !empty(zenkraftReturnApprovalCatalogCategories) && !isReturnApprovalRequired) {
        zenkraftReturnApprovalCatalogCategories = zenkraftReturnApprovalCatalogCategories.split(',');
        productLineItems.forEach(function(productLineItem) {
            var product = productLineItem.getProduct();
            if (product.isVariant()) {
                product = product.getMasterProduct();
            }
            var catalogCategories = product.getCategories().toArray();
            catalogCategories.forEach(function (catalogCategorie) {
                zenkraftReturnApprovalCatalogCategories.forEach(function (preferenceCatalogCategorie) {
                    if (catalogCategorie.getID().toLowerCase() === preferenceCatalogCategorie.toLowerCase()) {
                        isReturnApprovalRequired = true;
                        return isReturnApprovalRequired;
                    }
                });
            });
        });
    }
    return isReturnApprovalRequired;
};

exports.filterShippingMethodsForEstimatedDate = filterShippingMethodsForEstimatedDate;
exports.getFormattedDateTime = getFormattedDateTime;
exports.prepareZenkraftDataConfiguration = prepareZenkraftDataConfiguration;
exports.getTrackingJSONPreferences = getTrackingJSONPreferences;
exports.parseISOString = parseISOString;
exports.saveReturnLabel = saveReturnLabel;
exports.generateZenkraftExportData = generateZenkraftExportData;
exports.createUnapprovedZenkraftReturn = createUnapprovedZenkraftReturn;
exports.handleShippingMethods = handleShippingMethods;
exports.checkOrderRetrunApproval = checkOrderRetrunApproval;
exports.convertDate = convertDate;
exports.convertTime = convertTime;
