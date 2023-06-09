'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

module.exports.render = RenderHelper.renderStandardComponentWithContext('Newsletter', function(context) {
    return {
        fallbackRequestCatalogUrl: URLUtils.home().toString(),
        newsletterType: context.content.newsletterType ? context.content.newsletterType.value : 'standard',
        theme: context.content.theme ? context.content.theme.value : 'primary-1',
        text: {
            formHeading: context.content.heading ? context.content.heading : Resource.msg('newsletter.form.heading', 'hastens', null),
            emailPlaceholder: Resource.msg('newsletter.form.emailplaceholder', 'hastens', null),
            formSubmit: Resource.msg('newsletter.form.submit', 'hastens', null),
            confirmationHeading: Resource.msg('newsletter.confirmation.heading', 'hastens', null),
            confirmationMessage: Resource.msg('newsletter.confirmation.message', 'hastens', null),
            getACatalog: Resource.msg('newsletter.getacatalog', 'hastens', null),
            getACatalogLinkText: Resource.msg('newsletter.getacataloglinktext', 'hastens', null),
        },
    };
});
