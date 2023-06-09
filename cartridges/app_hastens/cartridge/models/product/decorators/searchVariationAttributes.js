'use strict';

var ATTRIBUTE_NAME = 'color';
var collections = require('*/cartridge/scripts/util/collections');
var productImagesHelper = require('*/cartridge/scripts/helpers/productImagesHelpers');
var URLUtils = require('dw/web/URLUtils');

module.exports = function (object, hit) {
    Object.defineProperty(object, 'variationAttributes', {
        enumerable: true,
        value: (function () {
            var colors = hit.getRepresentedVariationValues(ATTRIBUTE_NAME);

            return [{
                attributeId: 'color',
                id: 'color',
                swatchable: true,
                values: collections.map(colors, function (color) {
                    var apiImage = color.getImage('swatch', 0);
                    var apiImage2 = color.getImage('medium', 0);
                    if (!apiImage || !apiImage2) {
                        return {};
                    }
                    return {
                        id: color.ID,
                        description: color.description,
                        displayValue: color.displayValue,
                        value: color.value,
                        selectable: true,
                        selected: true,
                        images: {
                            swatch: [{
                                alt: apiImage.alt,
                                url: productImagesHelper.getDISImageURL(apiImage, 'swatch'),
                                title: apiImage.title
                            }]
                        },
                        variationImages: {
                            variation: [{
                                alt: apiImage2.alt,
                                url: productImagesHelper.getDISImageURL(apiImage2, 'medium'),
                                title: apiImage2.title
                            }]
                        },
                        url: URLUtils.url(
                            'Product-Show',
                            'pid',
                            hit.productID,
                            'dwvar_' + hit.productID.replace(/_/g, '__') + '_color',
                            color.value
                        ).toString()
                    };
                })
            }];
        }())
    });
};
