'use strict';

const ArrayList = require('dw/util/ArrayList');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');
var selectedCategory;


/**
 * Get the hierarchy of this category (from this to the 2nd level)
 * @param {*} category the category to search
 * @param {*} addRootCategory whether to include in search the 1st level category
 */
function getCategoryPath(category, addRootCategory) {
    addRootCategory = addRootCategory || false;
    var path = new ArrayList();

    if (!empty(category)) {
        while (category.parent && (!category.parent.root || category.parent.root === addRootCategory)) {
            if (category.online) {
                path.addAt(0, category);
            }
            category = category.parent;
        }
    }

    return path;
}


function getBelowCategories(selectedCategoryID, categoriesInThisLevel, stopAtThisLevel){
    var categoryFilters = new ArrayList();
    for(var i = 0; i < categoriesInThisLevel.length ; i ++){
        var isSelected = categoriesInThisLevel[i].ID == selectedCategoryID;
        categoryFilters.add(
            {
                displayName: categoriesInThisLevel[i].displayName,
                url: URLUtils.url('Search-Show', 'cgid', categoriesInThisLevel[i].ID),
                isSelected: isSelected,
                subCategories: !stopAtThisLevel ? getBelowCategories(selectedCategoryID,categoriesInThisLevel[i].onlineSubCategories) : new ArrayList()
            })
    }
    return categoryFilters;
}

/**
 * Get the category filters for PLP pages
 */
function getPLPCategoryFilters() {
    var categoryFilters = new ArrayList();
    var onlyFirstLevel = false;
    //Find exact category path
    var path = this.getCategoryPath(selectedCategory, true);
    if(path.length == 0) {
        //selected category is the root one -> load only 1st sub level
        path = this.getCategoryPath(selectedCategory, true);
        onlyFirstLevel = true;
    }
    var isSelected = path[0].ID == selectedCategory.ID;

    categoryFilters.add(
        {
            displayName: path[0].displayName,
            url: URLUtils.url('Search-Show', 'cgid', path[0].ID),
            isSelected: isSelected,
            subCategories: getBelowCategories(selectedCategory.ID, path[0].onlineSubCategories, onlyFirstLevel)
        });

    return categoryFilters;
}

/**
 * Get the category filters for Page Designer pages
 */
function getPDCategoryFilters(category) {
    var categoryFilters = new ArrayList();
    var onlyFirstLevel = false;
    //Find exact category path
    var path = getCategoryPath(category, true);
    if(path.length == 0) {
        //selected category is the root one -> load only 1st sub level
        path = getCategoryPath(category, true);
        onlyFirstLevel = true;
    }
    var isSelected = path[0].ID == category.ID;

    categoryFilters.add(
        {
            displayName: path[0].displayName,
            url: URLUtils.url('Search-Show', 'cgid', path[0].ID),
            isSelected: isSelected,
            subCategories: getBelowCategories(category.ID, path[0].onlineSubCategories, onlyFirstLevel)
        });

    return categoryFilters;
}

/**
 * Creates the category hierarchy
 * @param {*} apiProductSearch 
 * @param {*} params 
 */
function getCategoriesForShowAllMenu(apiProductSearch, params) {
    if((params && params.q) || !(apiProductSearch && apiProductSearch.category)) {
        var defaultCategoryId = Site.getCurrent().getCustomPreferenceValue("defaultCategoryID");
        selectedCategory = CatalogMgr.getCategory(defaultCategoryId);
    } else {
         //category selected by the customer
        selectedCategory = CatalogMgr.getCategory(apiProductSearch.category.ID);
    }
   
    //Category PLP - return category online from root (it doesn't use search refinements)
    return getPLPCategoryFilters();
}

/**
 * Creates the category hierarchy for the additional category 
 * @param {*} category 
 */
function getAdditionalCategoryForShowAllMenu(category) {
    var categoryFilters = new ArrayList();
    var onlyFirstLevel= true;
    //Find exact category path
    var path = getCategoryPath(category, true);

    categoryFilters.add(
        {
            displayName: path[0].displayName,
            url: URLUtils.url('Search-Show', 'cgid', path[0].ID),
            subCategories: getBelowCategories(category.ID, path[0].onlineSubCategories, onlyFirstLevel)
        })

    return categoryFilters;
}

/**
 * Get category description
 */
function getCategoryDescription(params){
    if(!params.q && selectedCategory && selectedCategory.description){
        return selectedCategory.description;
    }
}

/**
 * Returns the category hierarchy for the breadcrumb
 * @param {*} apiProductSearch 
 * @param {*} params 
 */
function getCategoryBreadcrumb(apiProductSearch, params) {
    var categoryBreadcrumb = new ArrayList();
    if(!params.q) {
        var path = getCategoryPath(selectedCategory, true);
        for (var i = 0; i < path.length; i ++) {
            categoryBreadcrumb.add(
                {
                    htmlValue: path[i].displayName,
                    url: URLUtils.url('Search-Show', 'cgid', path[i].ID)
                })
        }
    }
    return categoryBreadcrumb;
}

exports.getCategoriesForShowAllMenu = getCategoriesForShowAllMenu;
exports.getCategoryDescription = getCategoryDescription;
exports.getCategoryBreadcrumb = getCategoryBreadcrumb;
exports.getAdditionalCategoryForShowAllMenu = getAdditionalCategoryForShowAllMenu;
exports.getPDCategoryFilters = getPDCategoryFilters;
