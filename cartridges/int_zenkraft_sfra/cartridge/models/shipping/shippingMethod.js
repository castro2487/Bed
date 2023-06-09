// ShippingMethod.js model extension
'use strict';
var baseShippingMethodModel = module.superModule;

/**
* Extend ShippingMethodModel to include the zenkraft ID custom attribute
*
* @param {Object} shippingMethod sfcc shipping method object
* @param {Object} shipment sfcc shipment object
*/
function ShippingMethodModel(shippingMethod, shipment) {
    this.zenkraftID = shippingMethod.custom.zenkraftID;

    if ('dropOffMethod' in shippingMethod.custom) {
        this.dropOffMethod = shippingMethod.custom.dropOffMethod;
    }
    this.dropOffLocations = [];

    if ('zenkraftRateMarkupType' in shippingMethod.custom) {
        this.zenkraftRateMarkupType = shippingMethod.custom.zenkraftRateMarkupType;
    } else {
        this.zenkraftRateMarkupType = '';
    }

    if ('zenkraftRateMarkup' in shippingMethod.custom) {
        this.zenkraftRateMarkup = shippingMethod.custom.zenkraftRateMarkup;
    } else {
        this.zenkraftRateMarkup = '';
    }

    if (shipment) {
        this.shipStatus = shipment.shippingStatus.displayValue;
        this.trackingNumber = shipment.trackingNumber;
        this.zenkraftCarrier = shipment.custom.zenkraftCarrier;
    }
    baseShippingMethodModel.call(this, shippingMethod, shipment);
}

module.exports = ShippingMethodModel;
