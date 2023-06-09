'use strict';

var baseTotalModel = module.superModule;

var formatMoney = require('dw/util/StringUtils').formatMoney;

/**
 * Accepts a total object and formats the value
 * @param {dw.value.Money} total - Total price of the cart
 * @returns {string} the formatted money value
 */
function getTotals(total) {
    return !total.available ? '-' : formatMoney(total);
}

/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
function totals(lineItemContainer) {
    baseTotalModel.call(this, lineItemContainer);

    if (lineItemContainer) {
        if (this.totalShippingCost === '-') {
            this.totalNetPrice = '-';
        } else {
            this.totalNetPrice = getTotals(lineItemContainer.totalNetPrice);
        }
    } else {
        this.totalNetPrice = '-';
    }
}

module.exports = totals;
