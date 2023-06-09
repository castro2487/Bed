'use strict';
var base = module.superModule;

function fixQueryString(q) {
    const querystring = require('server').querystring;
    const qFix = String(q).replace(/&amp(?:%3B|;)/g, '&').replace(/amp(?:%3B|;)/, '');

    return new querystring(qFix);
}

// Exports ===================================================================

module.exports = {
    fixQueryString: fixQueryString
};

Object.keys(base).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins
    if (!module.exports.hasOwnProperty(prop)) {
        module.exports[prop] = base[prop];
    }
});