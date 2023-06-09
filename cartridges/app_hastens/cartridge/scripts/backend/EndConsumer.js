'use strict';

const helpers = require('./BackendHelpers');

let EndConsumer = {
    // Service constants
    SERVICE: {
        BEDS_LIST: 'hastens.end-consumer.beds-list',
        MATERIALS_LIST: 'hastens.end-consumer.materials-list',
        MATERIALS_INFO: 'hastens.end-consumer.materials-info',
        QUOTE_SAVE: 'hastens.end-consumer.quote-save',
        QUOTE_BED_PRICE: 'hastens.end-consumer.quote-bed-price',
    },

    bedsList: function () {
        return helpers.callApi(this.SERVICE.BEDS_LIST, 'GET', {l10n: true}, '', true);
    },

    materialsList: function (params) {
        return helpers.callApi(this.SERVICE.MATERIALS_LIST, 'GET', params, '')
    },

    materialsInfo: function (data) {
        return helpers.callApi(this.SERVICE.MATERIALS_INFO, 'POST', null, data);
    },

    quoteSave: function (data) {
        return helpers.callApi(this.SERVICE.QUOTE_SAVE, 'POST', null, data);
    },

    quoteBedPrice: function (data) {
        return helpers.callApi(this.SERVICE.QUOTE_BED_PRICE, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = EndConsumer;
