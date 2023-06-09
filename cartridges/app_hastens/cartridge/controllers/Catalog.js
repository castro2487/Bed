'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

/**
 * Redirect to a fixed URL in Polo that can handle the further redirect to
 * the external catalog host. Uses sv for now, we will eventually use a
 * route that is not language specific.
 *
 * BM: In SEO > URL Rules > Pipeline URLs, add
 *     catalog-digital => Catalog-DigitalCatalog
 */
server.get('DigitalCatalog', function (req, res, next) {
    const poloURL = 'https://api.hastens.com/en/catalog-digital?' + req.querystring;

    res.redirect(poloURL, 301);
    next();
});

server.get('Popup', function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');

    var apiContent = ContentMgr.getContent("has-catalog-popup-banner");
    var imgContent = "";
    if (apiContent) {
        imgContent = apiContent.custom.body.markup;
    } else {
        imgContent = 'https://static.hastens.com/blocks/request-catalog/catalog_request_us_435x427.jpg';
    }

    res.render('experience/components/standardComponent', {
        block: JSON.stringify({
            type: 'CatalogPopup',
            backendUrl: URLUtils.url('Backend-').toString(),
            staticUrl: URLUtils.staticURL('/').toString(),
            content: {
                text: {
                    bannerHeading: Resource.msg('catalogpopup.banner.heading', 'hastens', null),
                    imgContent: imgContent,
                    bannerBody: Resource.msg('catalogpopup.banner.body', 'hastens', null),
                    bannerCta: Resource.msg('catalogpopup.banner.cta', 'hastens', null),
                    formHeader: Resource.msg('requestcatalog.form.header', 'hastens', null),
                    confirmHeader: Resource.msg('requestcatalog.confirm.header', 'hastens', null),
                    confirmBody: Resource.msg('requestcatalog.confirm.body', 'hastens', null),
                    buttonClose: Resource.msg('buttons.close', 'hastens', null),
                    buttonCancel: Resource.msg('buttons.cancel', 'hastens', null),
                    buttonSend: Resource.msg('buttons.sendrequest', 'hastens', null),
                    labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
                    labelLastName: Resource.msg('forms.lastName', 'hastens', null),
                    labelEmail: Resource.msg('forms.email', 'hastens', null),
                    labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
                    labelStreetAddress: Resource.msg('forms.streetaddress', 'hastens', null),
                    labelApartment: Resource.msg('forms.apartment', 'hastens', null),
                    labelState: Resource.msg('forms.state', 'hastens', null),
                    labelCity: Resource.msg('forms.city', 'hastens', null),
                    labelCountry: Resource.msg('forms.country', 'hastens', null),
                    labelZip: Resource.msg('forms.postcode', 'hastens', null),
                    labelLanguage: Resource.msg('forms.language', 'hastens', null),
                    labelNewsletter: Resource.msg('forms.newsletter', 'hastens', null),
                    labelRequired: Resource.msg('forms.required', 'hastens', null),
                    labelConsent: Resource.msg('forms.consent', 'hastens', null),
                },
            },
        })
    });
    next();
});

module.exports = server.exports();
