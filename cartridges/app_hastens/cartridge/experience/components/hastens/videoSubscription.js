'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('VideoSubscription', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body ? context.content.body.value : '',
            buttonText: context.content.buttonText,
            videoSubscriptionConfirm: context.content.confirmationText,
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            buttonSubmit: Resource.msg('buttons.submit', 'hastens', null),
        },
        columns: context.content.columns ? parseInt(context.content.columns.value) : 1,
        textAlignment: context.content.textAlignment ? context.content.textAlignment.value : 'left',
        theme: context.content.theme ? context.content.theme.value : null,
        buttonColor: context.content.buttonColor ? context.content.buttonColor.value : null,
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };
});
