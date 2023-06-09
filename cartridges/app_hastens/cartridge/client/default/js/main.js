window.jQuery = window.$ = require('jquery');
var processInclude = require('./util');

require('./thirdParty/parsley');
require('./thirdParty/slick');

$(document).ready(function () {
    processInclude(require('./components/geoblock'));
    processInclude(require('./components/menu'));
    processInclude(require('./components/cookie'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/miniCart'));
    processInclude(require('./components/collapsibleItem'));
    processInclude(require('./components/search'));
    processInclude(require('./components/splashCountrySelector'));
    processInclude(require('./components/prefixSelector'));
    processInclude(require('./components/contactUs'));
    processInclude(require('./parsley'));

    var recaptcha = document.querySelector('#g-recaptcha-response');
    if (recaptcha) {
        // Make recaptcha a required field
        recaptcha.setAttribute('required', 'required');
        // Hide recaptcha textarea for screen readers
        recaptcha.setAttribute('aria-hidden', 'true');
    }
});

require('./components/cookiebot')
require('./thirdParty/bootstrap');
require('./components/spinner');
