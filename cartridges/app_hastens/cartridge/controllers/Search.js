'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.extend(module.superModule);

server.replace('Show', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var PageMgr = require('dw/experience/PageMgr');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var template = 'search/searchResults';

    var categoryId = req.querystring.cgid;
    var page = PageMgr.getPage(categoryId);

    var result = searchHelper.search(req, res);

    //if page designer page exists, render it
    if (page && page.isVisible()) {
        var data = {};
        data.cgid = result.apiProductSearch.categoryID;
        res.print(PageMgr.renderPage(page.ID, JSON.stringify(data)));
    } else {

        var Site = require('dw/system/Site');
        // list of sorting rules to exclude when online shopping is not enabled
        var excludedSortingOptions = Site.getCurrent().getCustomPreferenceValue('listSortingOptions') || [];

        if (result.searchRedirect) {
            res.redirect(result.searchRedirect);
            return next();
        }

        if (result.category && result.categoryTemplate) {
            template = result.categoryTemplate;
        }

        var redirectGridUrl = searchHelper.backButtonDetection(req.session.clickStream);
        if (redirectGridUrl) {
            res.redirect(redirectGridUrl);
        }

        this.on('route:BeforeComplete', function (req, res) {
            var SEOHelper = require('*/cartridge/scripts/helpers/SEOHelper');
            var CatalogMgr = require('dw/catalog/CatalogMgr');
            var Site = require('dw/system/Site');
            var viewData = res.getViewData();
            var productSearch = viewData.apiProductSearch;
            var additionalCategoryId = Site.getCurrent().getCustomPreferenceValue("additionalCategory");
    
            //Get additional category for show all menu
            if(additionalCategoryId) {
                var additionalCategory = CatalogMgr.getCategory(additionalCategoryId);
                viewData.additionalCategory = SEOHelper.getAdditionalCategoryForShowAllMenu(additionalCategory);
            }
           
            viewData.categoryFilters = SEOHelper.getCategoriesForShowAllMenu(productSearch, req.querystring);
    
            if(!req.querystring.q && viewData.productSearch && viewData.productSearch.category) {
                viewData.productSearch.category.description = SEOHelper.getCategoryDescription(req.querystring);
                viewData.breadcrumbs = SEOHelper.getCategoryBreadcrumb(productSearch, req.querystring);
            }        
        });

        res.render(template, {
            excludedSortingOptions: excludedSortingOptions,
            productSearch: result.productSearch,
            maxSlots: result.maxSlots,
            reportingURLs: result.reportingURLs,
            refineurl: result.refineurl,
            category: result.category ? result.category : null,
            canonicalUrl: result.canonicalUrl,
            schemaData: result.schemaData,
            apiProductSearch: result.apiProductSearch
        });
    }

    return next();
}, pageMetaData.computedPageMetaData);

server.append('ShowAjax', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {

    var Site = require('dw/system/Site');
    // list of sorting rules to exclude when online shopping is not enabled
    var excludedSortingOptions = Site.getCurrent().getCustomPreferenceValue('listSortingOptions') || [];

    var viewData = res.getViewData();
    viewData.excludedSortingOptions = excludedSortingOptions;
    res.setViewData(viewData);

    return next();


}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
