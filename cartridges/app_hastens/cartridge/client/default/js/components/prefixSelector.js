'use strict';

var keyboardAccessibility = require('./keyboardAccessibility');

module.exports = function () {

    $('.prefix-selector a').click(function (e) {
        // update prefix value
        var prefixValue = $(this).children(".prefix-value").text();
        var prefixInput = $(this).parent().siblings().children(".prefix-input");
        prefixInput.val(prefixValue);

        // update country flag
        var prefixCountryCode = $(this).data('country');
        var currentFlag = $(this).parent().siblings().children(".current-flag");
        currentFlag.removeClass();
        currentFlag.addClass('current-flag flag-icon flag-icon-' + prefixCountryCode.toLowerCase());

        // update prefix country code
        $(this).closest('.form-group').siblings('.form-group').children('.prefix-country-code').val(prefixCountryCode);
    });

    $('.prefix-selector').on('focusin', function () {
        $(this).addClass('show').children('.dropdown-menu').addClass('show');
    });

};
