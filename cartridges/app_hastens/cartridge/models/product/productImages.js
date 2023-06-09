'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var productImagesHelper = require('*/cartridge/scripts/helpers/productImagesHelpers');

/**
 * @constructor
 * @classdesc Returns images for a given product
 * @param {dw.catalog.Product} product - product to return images for
 * @param {Object} imageConfig - configuration object with image types
 */
function Images(product, imageConfig) {
   
    imageConfig.types.forEach(function (type) {
        var images = product.getImages(type);
        var result = {};

        if(images.length === 0) {
            var absURL = productImagesHelper.getMissingImageURL(type);
            var resizedAbsURL;
            if(type === 'large') {
                resizedAbsURL = productImagesHelper.getMissingImageURL('small');
            }
            result = [{
                alt: 'Missing Image',
                url: absURL,
                index: '0',
                title: 'Missing Image',
                absURL: absURL,
                resizedURL: resizedAbsURL || ''
            }];
        } else {
            if (imageConfig.quantity === 'single') {
                var firstImage = collections.first(images);
                if (firstImage) {
                    result = [{
                        alt: firstImage.alt,
                        url: firstImage.URL.toString(),
                        title: firstImage.title,
                        index: '0',
                        absURL: firstImage.absURL.toString()
                    }];
                }
            } else {
                result = collections.map(images, function (image, index) {
                    return {
                        alt: image.alt,
                        url: image.URL.toString(),
                        index: index.toString(),
                        title: image.title,
                        absURL: image.absURL.toString()
                    };
                });
            }
    
            for(var i = 0; i < result.length; i++) {
                var absURL = productImagesHelper.getDISImageURL(images[i], type);
                result[i].url = absURL;
                result[i].absURL = absURL;

                if(type === 'large') {
                    var resizedAbsURL = productImagesHelper.getDISImageURL(images[i], 'small');
                    result[i].resizedURL = resizedAbsURL;
                }
            }
        }
        
        this[type] = result;
    }, this);
}

module.exports = Images;
