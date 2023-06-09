'use strict';

/**
 * @constructor
 * @classdesc The stores model
 * @param {dw.catalog.Store} storeObject - a Store objects
 */
function store(storeObject) {
    if (storeObject) {
        this.ID = storeObject.ID;
        this.name = storeObject.name;
        this.address1 = storeObject.address1;
        this.address2 = storeObject.address2;
        this.city = storeObject.city;
        this.postalCode = storeObject.postalCode;
        this.latitude = storeObject.latitude;
        this.longitude = storeObject.longitude;
        this.displayAddress = storeObject.custom['display-address'] || '';
        this.stateCode = storeObject.stateCode;

        if (storeObject.phone) {
            var phoneArray = storeObject.phone.split(/,|\/|<.*?>/);
            this.phone = phoneArray[0] ? phoneArray : null;
        }

        if (storeObject.countryCode) {
            this.countryCode = storeObject.countryCode.value;
        }

        if (storeObject.custom['store-hours-json']) {
            this.storeHours = storeObject.custom['store-hours-json'];
            this.storeInfo = JSON.parse(this.storeHours).info;
        }

        if (storeObject.custom['pp-slug']) {
            this.urlSlug = storeObject.custom['pp-slug'];
        }
    }
}

module.exports = store;
