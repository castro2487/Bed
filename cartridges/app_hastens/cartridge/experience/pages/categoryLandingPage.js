'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');
var ProductHelper = require('*/cartridge/scripts/helpers/productHelpers.js');
var SEOHelper = require('*/cartridge/scripts/helpers/SEOHelper.js');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var Site = require('dw/system/Site');

/**
 * Render logic for the storepage.
 *
 * @param {dw.experience.PageScriptContext} context The page script context object.
 *
 * @returns {string} The template text
 */
module.exports.render = function (context) {
    var model = new HashMap();
    var page = context.page;
    var params = JSON.parse(context.renderParameters)
    model.page = page;

    // automatically register configured regions
    var metaDefinition = require('*/cartridge/experience/pages/storePage.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);

    // Determine seo meta data.
    // Used in htmlHead.isml via common/layout/page.isml decorator.
    model.CurrentPageMetaData = {};
    model.CurrentPageMetaData.title = page.pageTitle;
    model.CurrentPageMetaData.description = page.pageDescription;
    model.CurrentPageMetaData.keywords = page.pageKeywords;

    if (PageRenderHelper.isInEditMode()) {
        var HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    model.breadcrumbs = ProductHelper.getAllBreadcrumbs(params.cgid, null, []).reverse();

    var selectedCategory = CatalogMgr.getCategory(params.cgid);

    model.categoryFilters = SEOHelper.getPDCategoryFilters(selectedCategory);

    var additionalCategoryId = Site.getCurrent().getCustomPreferenceValue("additionalCategory");

    //Get additional category for show all menu
    if(additionalCategoryId) {
        var additionalCategory = CatalogMgr.getCategory(additionalCategoryId);
        model.additionalCategory = SEOHelper.getAdditionalCategoryForShowAllMenu(additionalCategory);
    }

    model.pageDesignerShowAllMenu = selectedCategory.custom.showAllCategories;

    // render the page
    return new Template('experience/pages/storePage').render(model).text;
};
