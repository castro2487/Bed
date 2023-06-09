'use strict';
/**
 * Hook for htmlHead to include Loqate content
 * @param {Object} args - current pdict, flags primary include
 */
function loqateInclude(args) {
    // do not render if it's called without context
    if (!args) {
        return;
    }
    var isml = require('dw/template/ISML');
    var loqate = require('*/cartridge/scripts/helpers/loqateHelpers');
    isml.renderTemplate('components/header/loqate', {
        loqateTag: loqate.getTag(args)
    });
}

exports.loqateInclude = loqateInclude;
