'use strict';

var Resource = require('dw/web/Resource');

module.exports = function (object, quantity, minOrderQuantity, availabilityModel) {
    Object.defineProperty(object, 'availability', {
        enumerable: true,
        value: (function () {
            var Site = require('dw/system/Site');
            var availability = {};
            availability.messages = [];
            var productQuantity = quantity ? parseInt(quantity, 10) : minOrderQuantity;
            var availabilityModelLevels = availabilityModel.getAvailabilityLevels(productQuantity);
            var inventoryRecord = availabilityModel.inventoryRecord;
            var allocation = inventoryRecord ? inventoryRecord.ATS : null;
            var lowStockValue = Site.getCurrent().getCustomPreferenceValue("lowStockValue");
            var notAvailable = false;

            availability.allocation = allocation ? allocation.value : '';

            //Set message for low stock availability
            availability.lowStockItems = false;
            if (allocation && allocation.value > 0 && allocation.value < lowStockValue && allocation.value >= productQuantity) {
                availability.lowStockItems = true;
                availability.messages.push(Resource.msg('label.low.stock', 'common', null));
            } else if (allocation && allocation.value <= 0) {
                notAvailable = true;
                availability.messages.push(Resource.msg('label.not.available', 'common', null));
            } else if (allocation && allocation.value < productQuantity) {
                availability.messages.push(Resource.msg('label.not.available.items', 'common', null));
            }

            if (inventoryRecord && inventoryRecord.inStockDate) {
                availability.inStockDate = inventoryRecord.inStockDate.toDateString();
            } else {
                availability.inStockDate = null;
            }

            if (availabilityModelLevels.inStock.value > 0) {
                if (availabilityModelLevels.inStock.value === productQuantity && !availability.lowStockItems) {
                    availability.messages.push(Resource.msg('label.instock', 'common', null));
                } 
            }

            if (availabilityModelLevels.preorder.value > 0) {
                if (availabilityModelLevels.preorder.value === productQuantity) {
                    availability.messages.push(Resource.msg('label.preorder', 'common', null));
                } else {
                    availability.messages.push(
                        Resource.msgf(
                            'label.preorder.items',
                            'common',
                            null,
                            availabilityModelLevels.preorder.value
                        )
                    );
                }
            }

            if (availabilityModelLevels.backorder.value > 0) {
                if (availabilityModelLevels.backorder.value === productQuantity) {
                    availability.messages.push(Resource.msg('label.back.order', 'common', null));
                } else {
                    availability.messages.push(
                        Resource.msgf(
                            'label.back.order.items',
                            'common',
                            null,
                            availabilityModelLevels.backorder.value
                        )
                    );
                }
            }

            if (availabilityModelLevels.notAvailable.value > 0) {
                if (availabilityModelLevels.notAvailable.value === productQuantity && !notAvailable) {
                    availability.messages.push(Resource.msg('label.not.available', 'common', null));
                } 
            }

            return availability;
        }())
    });
    Object.defineProperty(object, 'available', {
        enumerable: true,
        value: availabilityModel.isOrderable(parseFloat(quantity) || minOrderQuantity)
    });
};
