var isMobile = require('ismobilejs/dist/isMobile.min.js');

const kruxStore = JSON.parse(getCookie('krux_store')) || {};
salesForceDataLayer['user']['email_sha256'] = kruxStore['email_sha256'] ? kruxStore['email_sha256'] : null;
salesForceDataLayer['user']['device'] = getDevice();
salesForceDataLayer['user']['country'] = getCookie('country');


function getCookie(name) {
    var cookie = document.cookie.split(';').filter(function(item) {
        return item.trim().indexOf(name + '=') === 0;
    });
    return cookie.length ? cookie[0].split(/=(.+)/)[1] : null;
}

function getDevice() {
    var device = 'computer';
    device = isMobile.phone ? 'phone' : device;
    device = isMobile.tablet ? 'tablet' : device;
    return device;
}

