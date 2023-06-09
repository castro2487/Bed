'use strict';

//Custom attributes for PDP 
module.exports = function (object, apiProduct) {

    Object.defineProperty(object, 'composition', {
        enumerable: true,
        value: apiProduct.custom.composition ? apiProduct.custom.composition : null
    });

    Object.defineProperty(object, 'hideSizeSelection', {
        enumerable: true,
        value: apiProduct.custom.hideSizeSelection ? apiProduct.custom.hideSizeSelection : false
    });

    Object.defineProperty(object, 'hideColorSelection', {
        enumerable: true,
        value: apiProduct.custom.hideColorSelection ? apiProduct.custom.hideColorSelection : false
    });

    Object.defineProperty(object, 'colorContentAssetId', {
        enumerable: true,
        value: apiProduct.custom.colorContentAssetId ? apiProduct.custom.colorContentAssetId : null
    });
    
};