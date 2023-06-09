'use strict';

var server = require('server');
server.extend(module.superModule);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

var storefrontMiddlewares = require('*/cartridge/controllers/middlewares/index');
/**
 * storefrontSubmitPayment: inserire le function presenti nel controller di dafault di SFRA CheckoutService-SubmitPayment
 *      Se un metodo di pagamento utilizza il prepend('SubmitPayment') non sarà necessario implementarlo in questa middleware chain
 * TODO: test cartridgePath importance replace->prepend
 * appendSubmitPayment: Inserire tutte le logiche di server.append('SubmitPayment')
 * prependPlaceOrder: Inserire tutte le logiche di server.prepend('PlaceOrder')
 * appendPlaceOrder: Inserire tutte le logiche di server.append('PlaceOrder')
 */
server.replace(
    'SubmitPayment',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    storefrontMiddlewares.storefrontSubmitPayment,
    storefrontMiddlewares.appendSubmitPayment,
    storefrontMiddlewares.prependPlaceOrder,
    storefrontMiddlewares.storefrontPlaceOrder,
    storefrontMiddlewares.appendPlaceOrder
);

module.exports = server.exports();
