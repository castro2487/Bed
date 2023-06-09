'use strict';

var server = require('server');

server.extend(module.superModule);

server.replace('UpdateQuantity', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var CartModel = require('*/cartridge/models/cart');
    var collections = require('*/cartridge/scripts/util/collections');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });

        return next();
    }

    var productId = req.querystring.pid;
    var updateQuantity = parseInt(req.querystring.quantity, 10);
    var uuid = req.querystring.uuid;
    var productLineItems = currentBasket.productLineItems;
    var matchingLineItem = collections.find(productLineItems, function (item) {
        return item.productID === productId && item.UUID === uuid;
    });
    var availableToSell = 0;

    var totalQtyRequested = 0;
    var qtyAlreadyInCart = 0;
    var minOrderQuantity = 0;
    var perpetual = false;
    var canBeUpdated = false;
    var bundleItems;
    var bonusDiscountLineItemCount = currentBasket.bonusDiscountLineItems.length;

    if (matchingLineItem) {
        if (matchingLineItem.product.bundle) {
            bundleItems = matchingLineItem.bundledProductLineItems;
            canBeUpdated = collections.every(bundleItems, function (item) {
                var quantityToUpdate = updateQuantity *
                    matchingLineItem.product.getBundledProductQuantity(item.product).value;
                qtyAlreadyInCart = cartHelper.getQtyAlreadyInCart(
                    item.productID,
                    productLineItems,
                    item.UUID
                );
                totalQtyRequested = quantityToUpdate + qtyAlreadyInCart;
                availableToSell = item.product.availabilityModel.inventoryRecord.ATS.value;
                perpetual = item.product.availabilityModel.inventoryRecord.perpetual;
                minOrderQuantity = item.product.minOrderQuantity.value;
                return (totalQtyRequested <= availableToSell || perpetual) &&
                    (quantityToUpdate >= minOrderQuantity);
            });
        } else {
            availableToSell = matchingLineItem.product.availabilityModel.inventoryRecord.ATS.value;
            perpetual = matchingLineItem.product.availabilityModel.inventoryRecord.perpetual;
            qtyAlreadyInCart = cartHelper.getQtyAlreadyInCart(
                productId,
                productLineItems,
                matchingLineItem.UUID
            );
            totalQtyRequested = updateQuantity + qtyAlreadyInCart;
            minOrderQuantity = matchingLineItem.product.minOrderQuantity.value;
            canBeUpdated = (totalQtyRequested <= availableToSell || perpetual) &&
                (updateQuantity >= minOrderQuantity);
        }

        Transaction.wrap(function () {
            matchingLineItem.setQuantityValue(updateQuantity);

            var previousBounsDiscountLineItems = collections.map(currentBasket.bonusDiscountLineItems, function (bonusDiscountLineItem) {
                return bonusDiscountLineItem.UUID;
            });

            basketCalculationHelpers.calculateTotals(currentBasket);
            if (currentBasket.bonusDiscountLineItems.length > bonusDiscountLineItemCount) {
                var prevItems = JSON.stringify(previousBounsDiscountLineItems);

                collections.forEach(currentBasket.bonusDiscountLineItems, function (bonusDiscountLineItem) {
                    if (prevItems.indexOf(bonusDiscountLineItem.UUID) < 0) {
                        bonusDiscountLineItem.custom.bonusProductLineItemUUID = matchingLineItem.UUID; // eslint-disable-line no-param-reassign
                        matchingLineItem.custom.bonusProductLineItemUUID = 'bonus';
                        matchingLineItem.custom.preOrderUUID = matchingLineItem.UUID;
                    }
                });
            }
        });
    }


    if (matchingLineItem) {
        var basketModel = new CartModel(currentBasket);
        if (basketModel.valid.error && basketModel.valid.message) {
            basketModel.valid.outOfStockMessage = Resource.msg('error.out.of.stock.item', 'cart', null);
        }
        res.json(basketModel);
    } else {
        res.setStatusCode(500);
        res.json({
            errorMessage: Resource.msg('error.cannot.update.product.quantity', 'cart', null)
        });
    }

    return next();
});


server.replace('RemoveProductLineItem', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var CartModel = require('*/cartridge/models/cart');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });

        return next();
    }

    var isProductLineItemFound = false;
    var bonusProductsUUIDs = [];

    Transaction.wrap(function () {
        if (req.querystring.pid && req.querystring.uuid) {
            var productLineItems = currentBasket.getAllProductLineItems(req.querystring.pid);
            var bonusProductLineItems = currentBasket.bonusLineItems;
            var mainProdItem;
            for (var i = 0; i < productLineItems.length; i++) {
                var item = productLineItems[i];
                if ((item.UUID === req.querystring.uuid)) {
                    if (bonusProductLineItems && bonusProductLineItems.length > 0) {
                        for (var j = 0; j < bonusProductLineItems.length; j++) {
                            var bonusItem = bonusProductLineItems[j];
                            mainProdItem = bonusItem.getQualifyingProductLineItemForBonusProduct();
                            if (mainProdItem !== null
                                && (mainProdItem.productID === item.productID)) {
                                bonusProductsUUIDs.push(bonusItem.UUID);
                            }
                        }
                    }

                    var shipmentToRemove = item.shipment;
                    currentBasket.removeProductLineItem(item);
                    if (shipmentToRemove.productLineItems.empty && !shipmentToRemove.default) {
                        currentBasket.removeShipment(shipmentToRemove);
                    }
                    isProductLineItemFound = true;
                    break;
                }
            }
        }
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    if (isProductLineItemFound) {
        var basketModel = new CartModel(currentBasket);
        var basketModelPlus = {
            basket: basketModel,
            toBeDeletedUUIDs: bonusProductsUUIDs,
            emptyMsg: {
                msg1: Resource.msg('info.cart.empty.msg', 'cart', null),
                msg2: Resource.msg('info.cart.empty.msg2', 'cart', null),
                link: Resource.msg('info.cart.empty.link', 'cart', null),
                msg3: Resource.msg('info.cart.empty.msg3', 'cart', null)
            }
        };
        if (basketModel.valid.error && basketModel.valid.message) {
            basketModel.valid.outOfStockMessage = Resource.msg('error.out.of.stock.item', 'cart', null);
        }
        res.json(basketModelPlus);
    } else {
        res.setStatusCode(500);
        res.json({ errorMessage: Resource.msg('error.cannot.remove.product', 'cart', null) });
    }

    return next();
});

// Prevent adding products to Cart if online shopping is not enabled in the customer's country
server.prepend('AddProduct', function (req, res, next) {

    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    var currentCountry = Locale.getLocale(req.locale.id).country;
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    if (purchaseDisabled) {
        res.setStatusCode(404);
        res.render('error/notFoundPurchaseDisabled');
        this.emit('route:Complete', req, res);
        return;        
    }

    return next();

});


// Prevent access to Cart if online shopping is not enabled in the customer's country
server.prepend('Show', function (req, res, next) {

    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');

    var currentCountry = Locale.getLocale(req.locale.id).country;
    var listOfCountryWithPurchaseOption = Site.getCurrent().getCustomPreferenceValue('listOfCountryWithPurchaseOption');
    var purchaseDisabled = listOfCountryWithPurchaseOption.indexOf(currentCountry) < 0;

    if (purchaseDisabled) {
        res.setStatusCode(404);
        res.render('error/notFoundPurchaseDisabled');
        this.emit('route:Complete', req, res);
        return;
    }

    var TaxMgr = require('dw/order/TaxMgr');
    var taxRate = TaxMgr.getTaxRate('Standard', currentCountry) * 100;
    
    var viewData = res.getViewData();
    viewData.taxRate = taxRate;

    var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
    viewData.netTaxation = avataxSettings && avataxSettings.taxCalculation;
    viewData.avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

    viewData.paypalError = req.querystring.paypalError;

    var allowedPaymentMethods = Site.getCurrent().getCustomPreferenceValue('allowedPaymentMethods');
    viewData.showPayPalExpress = allowedPaymentMethods.indexOf('paypal_express') >= 0;

    res.setViewData(viewData);

    return next();

});

server.prepend('MiniCartShow', function (req, res, next) {
    var Site = require('dw/system/Site');

    var viewData = res.getViewData();
    var avataxSettings = JSON.parse(Site.getCurrent().getCustomPreferenceValue('ATSettings'));
    viewData.netTaxation = avataxSettings && avataxSettings.taxCalculation;
    viewData.avataxEnabled = Site.getCurrent().getCustomPreferenceValue('ATEnabled');

    var allowedPaymentMethods = Site.getCurrent().getCustomPreferenceValue('allowedPaymentMethods');
    viewData.showPayPalExpress = allowedPaymentMethods.indexOf('paypal_express') >= 0;

    res.setViewData(viewData);
    next();
});

module.exports = server.exports();