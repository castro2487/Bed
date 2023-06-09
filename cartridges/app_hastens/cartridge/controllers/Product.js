'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.extend(module.superModule);


/**
 * @typedef ProductDetailPageResourceMap
 * @type Object
 * @property {String} global_availability - Localized string for "Availability"
 * @property {String} label_instock - Localized string for "In Stock"
 * @property {String} global_availability - Localized string for "This item is currently not
 *     available"
 * @property {String} info_selectforstock - Localized string for "Select Styles for Availability"
 */

server.replace('Show', cache.applyPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var SEOHelper = require('*/cartridge/scripts/helpers/SEOHelper');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var Site = require('dw/system/Site');
    var additionalCategoryId = Site.getCurrent().getCustomPreferenceValue("additionalCategory");
    var Locale = require('dw/util/Locale');

    //Get additional category for show all menu
    if(additionalCategoryId) {
        var additionalCategory = CatalogMgr.getCategory(additionalCategoryId);
        additionalCategory = SEOHelper.getAdditionalCategoryForShowAllMenu(additionalCategory);
    }

    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);

    //Get product from ProductMgr in order to use category attributes
    var product = ProductMgr.getProduct(req.querystring.pid);
    if(product) {
        showProductPageHelperResult.product.primaryCategory = product.primaryCategory;
    }

    var currentCountry = Locale.getLocale(req.locale.id).country;
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;
    
    var productType = showProductPageHelperResult.product.productType;
    var categoryFilters = SEOHelper.getCategoriesForShowAllMenu();
    if (!showProductPageHelperResult.product.online && productType !== 'set' && productType !== 'bundle') {
        res.setStatusCode(404);
        res.render('error/notFound');
    } else {
        res.render(showProductPageHelperResult.template, {
            purchaseDisabled: purchaseDisabled,
            product: showProductPageHelperResult.product,
            addToCartUrl: showProductPageHelperResult.addToCartUrl,
            resources: showProductPageHelperResult.resources,
            breadcrumbs: showProductPageHelperResult.breadcrumbs,
            canonicalUrl: showProductPageHelperResult.canonicalUrl,
            schemaData: showProductPageHelperResult.schemaData,
            categoryFilters: categoryFilters,
            additionalCategory: additionalCategory,
            pdpShowAllMenu: true
        });
    }
    next();
}, pageMetaData.computedPageMetaData);

server.append('Variation', function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    
    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    // Customer's country
    var currentCountry = Locale.getLocale(req.locale.id).country;
    // List of countries for which online shopping is not enabled
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    var viewData = res.getViewData();
    viewData.purchaseDisabled = purchaseDisabled;
    var productId = viewData.product.id;
    viewData.breadcrumbs = productHelper.getAllBreadcrumbs(null, productId, []).reverse();
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();