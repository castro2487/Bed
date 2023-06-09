'use strict';

var processInclude = require('base/util');
// var baseCheckout = require('base/checkout/checkout');

$(document).ready(function () {
    // processInclude(baseCheckout);
    processInclude(require('./checkout/checkout'));
});
