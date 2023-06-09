'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('SpaceHolder', function(context) {
    return {
        theme: context.content.theme ? context.content.theme.value : null,
        hideOnMobile: context.content.visibility
    };
});
