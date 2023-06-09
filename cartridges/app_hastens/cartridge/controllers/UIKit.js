'use strict';

var server = require('server');
var system = require('dw/system/System');
var cache = require('*/cartridge/scripts/middleware/cache');

function isDev() {
    return system.getInstanceType() === 0;
}

server.get('Show', cache.applyDefaultCache, function (req, res, next) {
    // If not in DEV environment, redirect to Home
    if (!isDev()) {
        res.redirect(URLUtils.url('Home-Show'));
        return next();
    }

    res.render('uikit/uikit');
    next();
});

server.get('Icons', cache.applyDefaultCache, function (req, res, next) {
    // If not in DEV environment, redirect to Home
    if (!isDev()) {
        res.redirect(URLUtils.url('Home-Show'));
        return next();
    }

    res.render('uikit/icons');
    next();
});

module.exports = server.exports();
