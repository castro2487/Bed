'use strict';

function callApi(serviceName, method, params, data, localize) {
    const service = getService(serviceName, method);
    service.addHeader('Content-type','application/json');
    service.addHeader('charset', 'UTF-8');

    const credential = service.getConfiguration().credential;
    if (credential.password) {
        service.addHeader('X-Auth-Token', credential.password);
    }

    if (params) {
        if (params instanceof Object) {
            for (let name in params) {
                service.addParam(name, params[name]);
            }
        } else {
            service.URL += '/' + params;
        }
    }

    const res = service.call(data);

    if (res.isOk()) {
        const bodyText = res.getObject().getText();
        return {
            status: res.getStatus(),
            code: 200,
            body: JSON.parse(localize ? localizeText(bodyText) : bodyText),
        };
    } else {
        return {
            status: res.getStatus(),
            code: res.getError(),
            message: getErrorMessageFromJSONString(res.getErrorMessage()),
        }
    }
}

function getService(serviceName, method): Object {
    let service = null;

    try {
        service = dw.svc.LocalServiceRegistry.createService(serviceName, {
            createRequest: function (svc: HTTPService, args) {
                svc.setRequestMethod(method);
                if (args) {
                    return args instanceof Object ? JSON.stringify(args) : args;
                } else {
                    return null;
                }
            },
            parseResponse: function (svc: HTTPService, client) {
                return client;
            },
            filterLogMessage: function (msg) {
                return msg;
            },
        });
        logger().debug('Got service named {0}', serviceName);

    } catch (e) {
        logger().error('Failed getting service named {0}', serviceName);
    }

    return service;
}

function logger() {
    return dw.system.Logger.getLogger('Hastens', 'backend');
}

function localizeText(str) {
    return str.replace(/\$l10n\$([A-Z_]+)/g, function(match, key) {
        return dw.web.Resource.msg(key, 'backend', null);
    });
}

function getErrorMessageFromJSONString(string) {
    try {
        return JSON.parse(string).error.message;
    } catch (error) {
        return '';
    }
}

// Exports ===================================================================

module.exports = {
    callApi: callApi,
}
