'use strict';

function getLogger(type) {
    var logger = null;
    if (type && !empty(type)) {
        logger = dw.system.Logger.getLogger('ms-' + type, 'mulesoft');
    }
    return logger;
}

module.exports = {
    getLogger: getLogger
};

