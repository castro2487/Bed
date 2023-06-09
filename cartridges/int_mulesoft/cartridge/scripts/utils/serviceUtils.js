'use strict';

function setServiceCredentials(svc) {
    var StringUtils = require('dw/util/StringUtils'),
        Site = require('dw/system/Site'),
        Url = require('*/cartridge/scripts/util/Url');
    var authHeaderValue = 'Basic ' + StringUtils.encodeBase64(svc.configuration.credential.user + ':' + svc.configuration.credential.password);
    svc.addHeader('Authorization', authHeaderValue);
    // var credential = service.getConfiguration().credential;
    // service.addHeader('client_id', credential.user);
    // service.addHeader('client_secret', credential.password);
    // service.addHeader('Content-Type', 'application/xml;charset=utf-8');
    // service.setRequestMethod('POST');
    var siteID = Site.getCurrent().getID();
    svc.URL = Url.appendParametersToStringURL(svc.URL, {siteID : siteID});
    return svc;
}

/**
 * Return function to parse regular json reponse with logging to provided logger
 * @param  {dw.system.Log} logger Logger to log response info/errors
 * @return {function}        function to parse service reponse
 */
function parseResponse(logger) {
    return function(svc, resp) {
        var data = null;
        try {
            data = JSON.parse(resp.text);
        } catch (e) {
            logger.error(JSON.stringify(e));
        }
        return data;
    };
}

module.exports = {
    parseResponse: parseResponse,
    setServiceCredentials: setServiceCredentials
};
