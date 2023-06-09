'use strict';

const server = require('server');

/**
 */
server.get('Cancel', server.middleware.https, function (req, res, next) {
    res.render('hastens/privateSessionCancelConfirm', {
        bookingID: req.querystring.bookingID || '',
    });

    next();
});

module.exports = server.exports();
