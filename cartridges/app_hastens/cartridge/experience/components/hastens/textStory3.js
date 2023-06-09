'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('SmallTextStory', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body ? context.content.body.value : null,
        },
        headingWeight: context.content.headingWeight ? context.content.headingWeight.value : 'bold',
        theme: context.content.theme ? context.content.theme.value : null,
    };
});
