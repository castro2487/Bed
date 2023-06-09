'use strict';

module.exports = function (object, apiProduct) {

    Object.defineProperty(object, 'designerName', {
        enumerable: true,
        value: apiProduct.custom.designerName ? apiProduct.custom.designerName : null
    });

    Object.defineProperty(object, 'isStoreExclusive', {
        enumerable: true,
        value: apiProduct.custom.isStoreExclusive ? apiProduct.custom.isStoreExclusive : false
    });
    
};