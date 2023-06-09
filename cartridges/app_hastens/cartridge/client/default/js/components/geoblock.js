'usee strict';

function createCookie (name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function readCookie (name) {
    var nameEQ = encodeURIComponent(name) + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function eraseCookie (name) {
    createCookie(name, '', -1);
}

function getCurrentLocale () {
    return ($('.geoblockContainer').data('current-locale') || '');
}

function getPhysicalLocale () {
    return ($('.geoblockContainer').data('physical-locale') || '');
}

module.exports = function () {
    var lastLocaleVisitedKey = 'lastVisited';
    if ($('.geoblockContainerBlur').length !== 0) {

        // observe close button
        $('.geoblock-close').on('click', function (e) {
            createCookie(lastLocaleVisitedKey, getCurrentLocale());
            $('.geoblockContainerBlur').addClass('geoblockHidden');
        });

        // // observe visit button
        // $('.redirect-button').on('click', function (e) {
        //     createCookie(lastLocaleVisitedKey, getPhysicalLocale());
        //     $('.geoblockContainerBlur').addClass('geoblockHidden');
        // });

        let lastLocaleVisited = readCookie(lastLocaleVisitedKey);
        let currentLocale = getCurrentLocale();
        let physicalLocale = getPhysicalLocale();

        if (lastLocaleVisited !== null) {
            //  && lastLocaleVisited !== physicalLocale
            if (lastLocaleVisited !== currentLocale) {
                eraseCookie(lastLocaleVisitedKey);

                // Show new locale
                if (currentLocale !== physicalLocale) {
                    $('.geoblockContainerBlur').removeClass('geoblockHidden');
                }
            } else {
                $('.geoblockContainerBlur').addClass('geoblockHidden');
            }
        }
    }
};
