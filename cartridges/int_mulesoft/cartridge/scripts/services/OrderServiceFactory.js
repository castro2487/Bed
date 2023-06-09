const ServiceModel = require('*/cartridge/models/ServiceModel');

const MULESOFT_ORDER_CREATE = 'order.create';


function createService(type) {
    var service = null;

    switch (type) {
        case MULESOFT_ORDER_CREATE:
            service = ServiceModel.get('mulesoft.create.order');
            break;
        default:
            throw new Error('Service type:' + type + ' is unknown');
    }
    return service;
}

module.exports.createService = createService;
module.exports.MULESOFT_ORDER_CREATE = MULESOFT_ORDER_CREATE;

