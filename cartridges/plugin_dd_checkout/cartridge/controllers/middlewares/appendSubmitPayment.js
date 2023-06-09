'use strict';

function appendSubmitPayment(req, res, next) {
   /*  var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
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
            case '*YOUR-PAYMENT-METHOD-ID*' :
                *YOUR-PAYMENT-METHOD-IMPLEMENTATION*
                return next();
                break;
        }

    } */

    return next();
}

module.exports = appendSubmitPayment;
