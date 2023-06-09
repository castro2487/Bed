'use strict';

var decorators = require('*/cartridge/models/product/decorators/index');
var promotionCache = require('*/cartridge/scripts/util/promotionCache');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var URLUtils = require('dw/web/URLUtils');

/**
 * Get product search hit for a given product
 * @param {dw.catalog.Product} apiProduct - Product instance returned from the API
 * @returns {dw.catalog.ProductSearchHit} - product search hit for a given product
 */
function getProductSearchHit(apiProduct) {
    var searchModel = new ProductSearchModel();
    searchModel.setSearchPhrase(apiProduct.ID);
    searchModel.search();

    if (searchModel.count === 0) {
        searchModel.setSearchPhrase(apiProduct.ID.replace(/-/g, ' '));
        searchModel.search();
    }

    var hit = searchModel.getProductSearchHit(apiProduct);
    if (!hit) {
        var tempHit = searchModel.getProductSearchHits().next();
        if (tempHit.firstRepresentedProductID === apiProduct.ID) {
            hit = tempHit;
        }
    }
    return hit;
}

/**
 * Decorate product with product tile information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} productType - Product type information
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function productTile(product, apiProduct, productType) {
    var productSearchHit = getProductSearchHit(apiProduct);
    decorators.base(product, apiProduct, productType);
    decorators.searchPrice(product, productSearchHit, promotionCache.promotions, getProductSearchHit);
    decorators.images(product, apiProduct, { types: ['medium'], quantity: 'single' });
    decorators.ratings(product);
    if (productType === 'set') {
        decorators.setProductsCollection(product, apiProduct);
    }

    decorators.searchVariationAttributes(product, productSearchHit);

    //Add custom attributes
    decorators.customAttributes(product, apiProduct);

    if(!apiProduct.master) {
        var variationModel = apiProduct.variationModel;
        var color = variationModel.productVariationAttributes[1].ID;
        var masterId = variationModel.master.ID;
        var masterIdReplaced = masterId.replace(/_/g, '__');
        var dwvar = 'dwvar_' + masterIdReplaced + '_' + color;
        var selectedColor = productSearchHit.getRepresentedVariationValues(color)[0].value;
        product.url = URLUtils.url('Product-Show', 'pid', masterId, dwvar, selectedColor).toString();
    } else {
        product.url = URLUtils.url('Product-Show', 'pid', apiProduct.ID).toString();
    }

    product.firstRepresentedProduct = productSearchHit.firstRepresentedProduct;

    return product;
};
