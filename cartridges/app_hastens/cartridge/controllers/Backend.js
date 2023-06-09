'use strict';

const kruxEmail = require('~/cartridge/scripts/middleware/KruxEmail');
const server = require('server');
const language = dw.util.Locale.getLocale(request.locale).getLanguage();

server.post('CatalogSubscribe', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Catalog');
    const response = service.subscribe(appendLanguageToPayload(req.body));
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('ContactEmailConsent', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Contact');
    const response = service.emailConsent(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('CoordinatesGetCoordinates', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Coordinates');
    const response = service.getCoordinates();
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('CountriesGetAll', server.middleware.https, function(req, res, next) {
    const helpers = require('~/cartridge/scripts/helpers/customCacheHelpers');
    const countries = helpers.getCachedCountryNamesJson();
    res.json({
        body: countries,
        code: 200,
        status: 'OK',
    });
    next();
});

server.get('CountriesDefaultCustomer', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Countries');
    const country = req.querystring.country || 'US';
    const customerNumber = req.querystring.customerNumber || null;
    const params = { country: country };

    if (customerNumber) {
        params.customerNumber = customerNumber;
    }

    const response = service.defaultCustomer(params);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('EndConsumerBedsList', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/EndConsumer');
    const response = service.bedsList();
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('EndConsumerMaterialsList', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/EndConsumer');
    const category = req.querystring.category || '';
    const response = service.materialsList(category);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('EndConsumerMaterialsInfo', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/EndConsumer');
    const response = service.materialsInfo(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('EndConsumerQuoteSave', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/EndConsumer');
    const response = service.quoteSave(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('EndConsumerQuoteBedPrice', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/EndConsumer');
    const response = service.quoteBedPrice(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('LocationGetAllStores', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Location');
    const response = service.getAllStores();
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('LocationGetAllLocations', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Location');
    const showOnlyVividus = Boolean(req.querystring.showOnlyVividus);
    const response = service.getAllLocations(showOnlyVividus);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('MeetingBook', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Meeting');
    const response = service.book(appendLanguageToPayload(req.body));
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.get('MeetingPsTimeSlots', server.middleware.https, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Meeting');
    const partnerSlug = String(req.querystring.partnerSlug);
    const response = service.psTimeSlots(partnerSlug);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('MeetingPsBook', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Meeting');
    const response = service.psBook(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('NewsletterSubscribe', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Newsletter');

    let body;
    if (req.body) {
        // TypeScript form
        body = appendLanguageToPayload(req.body);
    } else {
        // JavaScript form
        body = {
            email: req.form.email,
            language: language,
        };
    }
    const response = service.subscribe(body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('SalesforceNbdLead', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Salesforce');
    const response = service.nbdLead(appendLanguageToPayload(req.body));
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('CollaborationsPost', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Collaborations');
    const response = service.post(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

server.post('CollaborationsRestoreCampaign', server.middleware.https, kruxEmail.capture, function(req, res, next) {
    const service = require('~/cartridge/scripts/backend/Collaborations');
    const response = service.restoreCampaign(req.body);
    res.setStatusCode(response.code);
    res.json(response);
    next();
});

function appendLanguageToPayload(payload) {
    const data = JSON.parse(payload);
    data.language = language;
    return data;
}

// Exports ===================================================================

module.exports = server.exports();
