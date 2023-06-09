'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.extend(module.superModule);

/**
 * Replace Home controller in order to render PageDesigner homepage if exists, otherwise
 * render default homepage
 */
server.replace('Show', consentTracking.consent, cache.applyDefaultCache, function (req, res, next) {
    var Site = require('dw/system/Site');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var PageMgr = require('dw/experience/PageMgr');

    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);

    // get the PageDesigner home-page,
    var page = PageMgr.getPage('home-page');

    if (page != null && page.isVisible()) {
        /*
        if (!page.hasVisibilityRules()) {
            res.cachePeriod = 168; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
        }
        */
        res.page(page.ID, {});
    } else {
        res.render('/home/homePage');
    }

    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
