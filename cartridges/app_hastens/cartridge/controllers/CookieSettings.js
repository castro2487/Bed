'use strict';

const server = require('server');

/**
 */
server.get('Show', server.middleware.https, function (req, res, next) {
    res.render('hastens/cookieSettings');

    next();
});

module.exports = server.exports();
