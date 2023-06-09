'use strict';

function objectAssign(target, varArgs) {
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

function cleanNumber(num) {
    return parseFloat(num.replace('.', '').replace(',', '.').replace(/[^0-9.]/, '')).toFixed(2);
}

module.exports = {
    objectAssign: objectAssign,
    cleanNumber: cleanNumber
};
