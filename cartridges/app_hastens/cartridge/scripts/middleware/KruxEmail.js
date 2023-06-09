'use strict';
importPackage(dw.util);

function sha256digest(body) {
    const bytes = new dw.util.Bytes(body.email);
    const crypto = new dw.crypto.MessageDigest(dw.crypto.MessageDigest.DIGEST_SHA_256);
    const sha256Email = dw.crypto.Encoding.toBase64(crypto.digestBytes(bytes));
    return sha256Email;
}

function getKruxCookie(cookieString) {
    const cookieArray = cookieString.split(';');
    let kruxCookie = '{}';
    cookieArray.forEach(function (item) {
        if (item.trim().indexOf('krux_store' + '=') === 0) {
            kruxCookie = item.split(/=(.+)/)[1];
        }
    })

    return JSON.parse(kruxCookie);
}

/**
 * Middleware to capture email address from form submissions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function kruxEmail(req, res, next) {
    var body;

    if (req.body) {
        // TypeScript form
        body = JSON.parse(req.body);
    } else {
        // JavaScript form
        body = {email: req.form.email};
    }
    if (body.hasOwnProperty('email')) {
        const sha256Email = sha256digest(body);
        let kruxCookie = null;

        if (req.httpHeaders.cookie) {
            kruxCookie = getKruxCookie(req.httpHeaders.cookie);
        }

        kruxCookie['email_sha256'] = sha256Email;
        const cookie = new dw.web.Cookie('krux_store', JSON.stringify(kruxCookie));
        cookie.setPath('/');
        res.base.addHttpCookie(cookie);

        res.setViewData({
            krux_sha256_email: sha256Email
        });
    }
    next();
}

module.exports = {
    capture: kruxEmail
};
