'use strict';

var URLUtils = require('dw/web/URLUtils');

var styles = [];
var scripts = [];
var libScripts = [];

/**
 * If the resource to add is not already in the resource array then add it to the array
 * @param {Array} resourceArray - Either the scripts or styles array to which you want to add the resource src to.
 * @param {string} src - URI of the resource to add
 * @param {string} integrity - cryptographic hash of a resource
 * @param {string|null} type
 */
 function addResource(resourceArray, src, integrity, type) {
    var result = {};
    var exists = resourceArray.some(function (element) {
        return element.src === src;
    });

    if (!exists) {
        result.src = src;
        result.type = type || 'text/javascript';
        if (integrity) {
            result.integrity = integrity;
        }

        resourceArray.push(result);
    }
}

module.exports = {
    addCss: function (src, integrity) {
        if (/((http(s)?:)?\/\/).*.css/.test(src)) {
            addResource(styles, src, integrity, null);
        } else {
            addResource(styles, URLUtils.staticURL(src).toString(), integrity, null);
        }
    },
    addJs: function (src, integrity, type) {
        if (/((http(s)?:)?\/\/).*.js/.test(src)) {
            addResource(scripts, src, integrity, type);
        } else {
            addResource(scripts, URLUtils.staticURL(src).toString(), integrity, type);
        }
    },
    addJsLib: function (src, integrity, type) {
        if (/((http(s)?:)?\/\/).*.js/.test(src)) {
            addResource(libScripts, src, integrity, type);
        } else {
            addResource(libScripts, URLUtils.staticURL(src).toString(), integrity, type);
        }
    },
    scripts: scripts,
    libScripts: libScripts,
    styles: styles
};
