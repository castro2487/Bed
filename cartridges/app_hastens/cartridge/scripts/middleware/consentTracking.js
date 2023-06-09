'use strict';

/**
 * Get necessary cookie data for Cookiebot consent.
 * The cookie data seems to be stored as JSON5, so we can not use JSON.parse()
 * to get it. Just match directly on the string.
 *
 * @param {string} cookieString
 * @returns {Object}
 */
function getCookiebotCookie(cookieString) {
    const cookiebotData = cookieString.split(/;\s*/).filter(function (e) {
        return /^CookieConsent=/.test(e);
    });

    if (cookiebotData.length === 0) {
        return {};
    }

    return {
        necessary: /necessary:true/.test(cookiebotData[0]),
        preferences: /preferences:true/.test(cookiebotData[0]),
        statistics: /statistics:true/.test(cookiebotData[0]),
        marketing: /marketing:true/.test(cookiebotData[0])
    };
}

/**
 * Middleware to use consent tracking check.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function consent(req, res, next) {
    const cookie = getCookiebotCookie(req.httpHeaders.cookie || '');
    if (cookie === {}) {
        req.session.privacyCache.set('consent', null);
        req.session.raw.setTrackingAllowed(false);
    } else if (cookie.marketing === false) {
        req.session.privacyCache.set('consent', false);
        req.session.raw.setTrackingAllowed(false);
    } else if (cookie.marketing === true) {
        req.session.privacyCache.set('consent', true);
        req.session.raw.setTrackingAllowed(true);
    }

    res.setViewData({
        tracking_consent: req.session.privacyCache.get('consent')
    });
    next();
}

module.exports = {
    consent: consent
};
