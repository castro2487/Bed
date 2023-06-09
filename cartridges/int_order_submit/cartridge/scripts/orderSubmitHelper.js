var OrderSubmitHelper = {
    /**
     * @function createOrderSubmitRequest This function creates a request object for OMS order submit
     * @param order - The SFCC API Order object
     * @return {String} A request xml string for OMS order submit
     */
    createOrderSubmitRequest: function (order) {
        try {
            return order.getOrderExportXML(null, null);
        } catch (error) {
            return null;
        }
    }
};

module.exports = OrderSubmitHelper;
