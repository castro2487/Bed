'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BedColorViewer', function(context) {
    return {
        bed: context.content.bed.value,
        text: {
            heading: context.content.heading,
            colorLabel: context.content.colorLabel,
        }
    };
});
