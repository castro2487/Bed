'use strict';

module.exports = function () {
    $('.country-selector-js a.B2C-country').click(function (e) {
        e.preventDefault();
        var action = $('.page').data('action');
        var localeCode = $(this).data('locale');
        var localeCurrencyCode = $(this).data('currencycode');
        var queryString = $('.page').data('querystring');
        var url = $('.country-selector-js').data('url');
        var errorUrl = $('.country-selector-js').data('error-url');
        var siteId = $(this).data('siteid');

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            data: {
                code: localeCode,
                queryString: queryString,
                CurrencyCode: localeCurrencyCode,
                action: action,
                siteId: siteId
            },
            success: function (response) {
                if (response && response.redirectUrl) {
                    window.location.href = response.redirectUrl;
                }
            },
            error: function () {
                window.location.href = errorUrl;
            }
        });
    });
};
