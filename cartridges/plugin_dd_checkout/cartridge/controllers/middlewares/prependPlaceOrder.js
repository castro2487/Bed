'use strict';

/**
 * Function coparative server.prepend('PlaceOrder') Controller CheckoutServices
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @this {*}
 * @returns
 */

function prependPlaceOrder(req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');

    var adyenCheckoutServices = require('*/cartridge/controllers/middlewares/checkout_services/index');
    var _this = this;
    var cbEmitter = function cbEmitter(route) {
        return _this.emit(route, req, res);
    };

    var currentBasket = BasketMgr.getCurrentBasket();
    if (!currentBasket) {
        res.json({
            error: true,
            cartError: true,
            fieldErrors: [],
            serverErrors: [],
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var iter = currentBasket.getPaymentInstruments().iterator();

    while (iter.hasNext()) {
        var pi = iter.next();
        //pi is the current paymentInstrument
        switch(pi.paymentMethod) {
            case 'AdyenComponent' :
                adyenCheckoutServices.placeOrder(req, res, next, cbEmitter);
                break;
        }
    }

}

module.exports = prependPlaceOrder;
