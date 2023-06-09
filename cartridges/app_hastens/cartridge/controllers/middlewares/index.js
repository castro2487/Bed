'use strict';

var storefrontSubmitPayment = require('./storefrontSubmitPayment');
var storefrontPlaceOrder = require('./storefrontPlaceOrder');
var appendSubmitPayment = require('./appendSubmitPayment');
var prependPlaceOrder = require('./prependPlaceOrder');
var appendPlaceOrder = require('./appendPlaceOrder');

module.exports = {
    storefrontSubmitPayment: storefrontSubmitPayment,
    storefrontPlaceOrder: storefrontPlaceOrder,
    appendSubmitPayment: appendSubmitPayment,
    prependPlaceOrder: prependPlaceOrder,
    appendPlaceOrder: appendPlaceOrder
};
