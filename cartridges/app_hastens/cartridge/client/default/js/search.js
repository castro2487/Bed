'use strict';

var processInclude = require('./util');

$(document).ready(function () {
    processInclude(require('./search/search'));
    processInclude(require('./product/quickView'));
    processInclude(require('./product/wishlistHeart'));
});

$('.filter-results').click(function () {
    $('body').css('overflow', 'hidden');
});

$('.filter-header .close').click(function () {
    $('body').css('overflow', 'auto');
});