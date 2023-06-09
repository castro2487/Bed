'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');
var RegionModelRegistry = require('*/cartridge/experience/utilities/RegionModelRegistry.js');
var ProductHelper = require('*/cartridge/scripts/helpers/productHelpers.js');
var SEOHelper = require('*/cartridge/scripts/helpers/SEOHelper.js');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var Site = require('dw/system/Site');
var StringHelper = require('~/cartridge/experience/utilities/StringHelper.js');

/**
 * @param {dw.experience.PageScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
    const model = new HashMap();
    const page = context.page;
    model.page = page;
    model.catalogPopup = context.content.catalogPopup && !PageRenderHelper.isInEditMode();

    var renderParameters = JSON.parse(context.renderParameters || '{}');
    if (renderParameters && renderParameters.showLanguageSelectorOnPageLoad) {
        model.showLanguageSelectorOnPageLoad = renderParameters.showLanguageSelectorOnPageLoad;
    }

    const metaDefinition = require('*/cartridge/experience/pages/storePage.json');
    model.regions = new RegionModelRegistry(page, metaDefinition);

    model.CurrentPageMetaData = {};
    model.CurrentPageMetaData.title = page.pageTitle;
    model.CurrentPageMetaData.description = page.pageDescription;
    model.CurrentPageMetaData.keywords = page.pageKeywords;

    model.className = StringHelper.makeClassName([
        context.content.componentSpacing ? context.content.componentSpacing.value : 'show-component-spacing',
        context.content.bottomSpacing ? context.content.bottomSpacing.value : 'show-bottom-spacing',
        context.content.pageTheme && context.content.pageTheme.value === 'dark' ? 'has-page-theme--dark' : null,
    ]);

    if (PageRenderHelper.isInEditMode()) {
        const HookManager = require('dw/system/HookMgr');
        HookManager.callHook('app.experience.editmode', 'editmode');
        model.resetEditPDMode = true;
    }

    const accessoryPage = 'Hastens_accessories';
    if (model.page['ID'] === accessoryPage) {
        model.breadcrumbs = ProductHelper.getAllBreadcrumbs(accessoryPage, null, []).reverse();

        const selectedCategory = CatalogMgr.getCategory(accessoryPage);

        model.categoryFilters = SEOHelper.getPDCategoryFilters(selectedCategory);

        const additionalCategoryId = Site.getCurrent().getCustomPreferenceValue('additionalCategory');

        //Get additional category for show all menu
        if(additionalCategoryId) {
            const additionalCategory = CatalogMgr.getCategory(additionalCategoryId);
            model.additionalCategory = SEOHelper.getAdditionalCategoryForShowAllMenu(additionalCategory);
        }

        model.pageDesignerShowAllMenu = selectedCategory.custom.showAllCategories;
    }

    //set action in order to change language in PD pages
    const homePage = 'home-page';
    if(model.page['ID'] === homePage) {
        model.action = 'Home-Show';
    } else {
        model.action = 'Search-Show';
        model.queryString = 'cgid=' + model.page['ID'];
    }

    const assets = require('*/cartridge/scripts/assets.js');
    assets.addJs('/js/hastens/blocks.js');
    assets.addCss('/css/hastens/blocks.css');

    if (PageRenderHelper.isInEditMode()) {
        assets.addJs('/js/hastens/editMode.js');
        assets.addCss('/css/hastens/editMode.css');
    }

    return new Template('experience/pages/storePage').render(model).text;
};
