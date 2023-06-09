'use strict';
/**
 * Model for Demandware Service implementation. Creates a ServiceModel class with helper methods
 * for getting and configuring market specific service, get custom service credential data, etc.
 * @module models/ServiceModel
 */


/**
 * Service helper providing enhanced services functionality
 * @class module:models/ServiceModel~ServiceModel
 *
 * @param {dw.svc.Service} obj The service object to enhance/wrap.
 */

var ServiceModel = {


    /**
     * @function createServiceCall The function create a request object
     * @param serviceName - sfcc service name
     * @param requestMethod - type of method used for the http request
     * @return {Object} A request object
     */
    createService: function (serviceName, requestMethod) {

        var service = dw.svc.LocalServiceRegistry.createService(serviceName, {
            // eslint-disable-next-line no-undef
            createRequest: function (service: HTTPService, req) {
                service.addHeader('Content-Type', 'application/json');
                service.setRequestMethod(requestMethod);
                return req;
            },
            // eslint-disable-next-line no-undef
            parseResponse: function (service: HTTPService) {
                return JSON.parse(service.getClient().text);
            }
        });
        return service;
    }


};


/**
 * Create and get a new instance for a given service reference or service object according to current Site and/or Country.
 * The instance itself will be always "local", so no need a workaround {"forceReInit":true} while development
 *
 * @alias module:models/ServiceModel~ServiceModel/get
 * @param serviceReference {dw.svc.Service|String} Demandware service name (without market suffixes) or service object
 * @returns {module:models/ServiceModel~ServiceModel} A new instance of ServiceModel that wraps the passed form.
 */
ServiceModel.get = function (serviceReference) {
    var serviceInstance = null;
    var serviceCallback = null;

    if (typeof serviceReference === 'string') {
        var serviceID = this.getServiceID(serviceReference);
        serviceCallback = this.getServiceCallback(serviceReference);
        if (!empty(serviceCallback)) {
            serviceInstance = dw.svc.LocalServiceRegistry.createService(serviceID, serviceCallback);
        } else {
            require('dw/system/Logger').error("ServiceModel.js : serviceCallback not found for service {0}", serviceReference);
            throw new Error("serviceCallback not found for service " + serviceReference);
        }
    } else if (typeof serviceReference === 'object') {
        serviceInstance = serviceReference;
    }

    return serviceInstance;
};

/*
 * Get registered service callback object by service reference.
 * Service callbacks are registered in scripts/config/services.json
 *
 * @param  {String} serviceReference Service reference (without suffixes)
 * @return {Object|dw.svc.ServiceCallback|null} service callback object or null if not found
 */
ServiceModel.getServiceCallback = function (serviceReference) {
    var serviceCallback = null;
    var registeredCallbacks = require('*/cartridge/scripts/config/services').serviceCallbacks;
    if (serviceReference in registeredCallbacks) {
        var serviceCallbackPath = registeredCallbacks[serviceReference];
        var parts = serviceCallbackPath.split(':');
        if (parts.length > 1) {
            var scModulePath = parts[0];
            var scProperty = parts[1];
            serviceCallback = require(scModulePath)[scProperty];
            if (typeof (serviceCallback) === 'function') {
                serviceCallback = serviceCallback();
            }
        } else {
            serviceCallback = require(serviceCallbackPath);
        }
    }

    return serviceCallback;
};

/**
 * Get existing (configured in BM) service ID according to current Site and/or Country
 *
 * @param  {String} serviceName Demandware service name (without market suffixes).
 * @return {String}
 */
ServiceModel.getServiceID = function (serviceName) {
    var siteID = dw.system.Site.getCurrent().ID.toLowerCase();
    var sitePrefix = siteID.split('-')[0];
    var countryID = dw.util.Locale.getLocale(request.locale).getCountry().toLowerCase(); // country/region ISO 3166 2-letter code
    var possibleIDs = [
        serviceName + '.' + siteID + '.' + countryID,
        serviceName + '.' + siteID,
        serviceName + '.' + sitePrefix,
        serviceName + '.' + countryID,
        serviceName
    ];

    var localServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var serviceExistence = false;
    var idToReturn = null;

    for (let i = 0; i < possibleIDs.length; i++) {
        try {
            serviceExistence = (localServiceRegistry.createService(possibleIDs[i], this.getServiceCallback(serviceName)));
        } catch (e) {
            continue;
        }
        if (serviceExistence) {
            idToReturn = possibleIDs[i];
            return idToReturn;
        }
    }

    return idToReturn;
};



/** The service class */
module.exports = ServiceModel;
