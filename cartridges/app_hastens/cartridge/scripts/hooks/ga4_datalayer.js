'use strict';

const helpers = require('~/cartridge/scripts/helpers/dataLayerHelpers');

/**
 * Called by the app.template.afterFooter hook to add GA4 events to the
 * dataLayer. We can only handle events that cause a page load here.
 *
 * TODO: Use the int_handlerframework for hooking in to the event system so
 *       we can catch XHR sub-requests as well.
 *       Currently we subscribe to events in the frontend to handle these,
 *       but that is probably not the "correct" way.
 *
 * @param {Object} params
 */
function afterFooter(params: Object) {
    const velocity = require('dw/template/Velocity');
    const events = generateEvents(params);

    if (!events.length) {
        // Skip if no events were added
        return;
    }

    const inject = "<!-- GA4 events - start -->\n" +
        "<script type=\"text/javascript\">\n" +
        "try {\n" +
        "    #foreach ($event in $events)\n" +
        "    if (typeof $event != 'undefined') {\n" +
        "        window.dataLayer.push($event);\n" +
        "    }\n" +
        "    #end\n" +
        "} catch (e) {\n" +
        "    console.error(e);\n" +
        "}" +
        "</script>\n" +
        "<!-- GA4 Events - end -->\n";

    velocity.render(inject, {
        events: events,
    });
}

/**
 * Generate the events to insert into the data layer. Since the hook is called
 * from several general templates, we need to check the dispatching action
 * and/or the params data to find out the correct event(s) to generate.
 *
 * @param {Object} params
 * @returns {Array} Event data as JSON strings
 */
function generateEvents(params: Object) {
    let events = [];
    events.pushIfNotEmpty = function (event) {
        if (event) {
            this.push(event);
        }
    }

    events.pushIfNotEmpty(generateViewItemEvent(params));
    events.pushIfNotEmpty(generateViewItemEventUA(params));
    events.pushIfNotEmpty(generateViewCartEvent(params));
    events.pushIfNotEmpty(generateBeginCheckoutEvent(params));
    events.pushIfNotEmpty(generateBeginCheckoutEventUA(params));
    events.pushIfNotEmpty(generatePurchaseEvent(params));
    events.pushIfNotEmpty(generatePurchaseEventUA(params));

    return events;
}

// Event generators ============================================================

function generateViewItemEvent(params: Object) {
    return isAction(params, ['Product-Show'])
        ? generateEventJSON('view_item', [params.product]) : null;
}

function generateViewItemEventUA(params: Object) {
    return isAction(params, ['Product-Show'])
        ? generateResponseJSON(
            'eec.click',
            {
                click: {
                    actionField: {
                        list: 'Category Page'
                    },
                    products: generateUAItemData([params.product])
                }
            }
        ) : null;

}

function generateViewCartEvent(params: Object) {
    // params.items is a list, which is not iterable so we need to call toArray.
    return isAction(params, ['Cart-Show'])
        ? generateEventJSON('view_cart', params.items.toArray()) : null;
}

function generateBeginCheckoutEvent(params: Object) {
    return isAction(params, ['Checkout-Begin'], 'shipping')
        ? generateEventJSON('begin_checkout', params.order.items.items) : null;
}

function generateBeginCheckoutEventUA(params: Object) {
    return isAction(params, ['Checkout-Begin'], 'shipping')
        ? generateResponseJSON(
            'eec.checkout',
            {
                checkout: {
                    actionField: {
                        step: '1'
                    },
                    products: generateUAItemData(params.order.items.items)
                }
            }
        ) : null;
}

function generatePurchaseEvent(params: Object) {
    if (!isAction(params, ['Order-Confirm'])) {
        return null;
    }

    const purchaseInfo = {
        transaction_id: params.order.orderNumber,
        value: helpers.cleanNumber(params.order.priceTotal),
        tax: helpers.cleanNumber(params.order.totals.totalTax),
        shipping: helpers.cleanNumber(params.order.totals.totalShippingCost)
    };

    return generateEventJSON('purchase', params.order.items.items, purchaseInfo);
}

function generatePurchaseEventUA(params: Object) {
    return isAction(params, ['Order-Confirm'])
        ? generateResponseJSON(
            'eec.purchase',
            {
                purchase: {
                    actionField: {
                        id: params.order.orderNumber,
                        revenue: helpers.cleanNumber(params.order.priceTotal),
                        tax: helpers.cleanNumber(params.order.totals.totalTax),
                        shipping: helpers.cleanNumber(params.order.totals.totalShippingCost)
                    },
                    products: generateUAItemData(params.order.items.items)
                }
            }
        ) : null;
}

// Support =====================================================================

/**
 * Generate a complete GT4 event from items, with additional properties from props.
 *
 * Skipping item_id and item_variant since Analytics don't handle them
 * correctly as of now.
 *
 * @param name
 * @param items
 * @param props
 * @returns {string}
 */
function generateEventJSON(name, items, props) {
    let itemData = [];
    let value = 0;
    let currency = '';

    items.forEach(function (item) {
        const category = item.primaryCategory ? item.primaryCategory.displayName : '';
        const variant = getVariant(item);
        let data = {
            // item_id: item.id,
            item_name: item.productName,
            quantity: (item.quantity || item.selectedQuantity || 0).toString(),
        };
        if (variant) {
            // data.item_variant = variant;
        }
        if (category) {
            data.item_category = category;
        }
        if (item.price.sales) {
            data.price = item.price.sales.value.toFixed(2);
            data.currency = item.price.sales.currency;
            value += data.price * data.quantity;
            currency = data.currency;
        }
        itemData.push(data);
    });

    let retVal = {
        items: itemData
    }
    if (currency) {
        retVal.currency = currency;
    }
    if (value > 0) {
        retVal.value = value.toFixed(2);
    }

    return generateResponseJSON(name, helpers.objectAssign(retVal, props || {}));
}

/**
 * Generate a products array appropriate for UA events. We use separate steps
 * of UA, since the product data is added under different properties depending
 * on the event.
 *
 * @param items
 * @param category
 * @returns {[]}
 */
function generateUAItemData(items, category) {
    let itemData = [];

    items.forEach(function (item) {
        const category = category || item.primaryCategory ? item.primaryCategory.displayName : '';
        const variant = getVariant(item);
        const data = {
            id: item.id,
            name: item.productName,
            quantity: (item.quantity || item.selectedQuantity || 0).toString(),
        };
        if (variant) {
            data.variant = variant;
        }
        if (category) {
            data.category = category;
        }
        if (item.price.sales) {
            data.price = item.price.sales.value.toFixed(2);
            data.currency = item.price.sales.currency;
        }
        itemData.push(data);
    });

    return itemData;
}

/**
 * Generate a complete event as a JSON string.
 *
 * @param name
 * @param data
 * @returns {string}
 */
function generateResponseJSON(name, data) {
    return JSON.stringify({
        event: name,
        ecommerce: data
    });

}
/**
 * Check if the action identified by params is actionable.
 *
 * @param params
 * @param actions Array of action names
 * @param stage   - stage name to check
 *                - false if currentStage should not be set
 *                - undefined if we don't care
 * @returns {boolean}
 */
function isAction(params: Object, actions: Array, stage) {
    if (actions.indexOf(params.action) === -1) {
        return false;
    }
    if (typeof stage === 'undefined') {
        return true;
    }
    if (stage === false) {
        return !params.hasOwnProperty('currentStage');
    }
    return params.currentStage === stage;
}

/**
 * Return a string of all selected variants.
 *
 * @param item
 * @returns {string|null}
 */
function getVariant(item) {
    if (!item.variationAttributes) {
        return null;
    }

    let variations = [];
    item.variationAttributes.forEach(function (v) {
        if (v.displayValue) {
            variations.push(v.displayName + ': ' + v.displayValue);
        } else {
            const selected = v.values.map(function (cur) {
                return cur.selected ? cur.displayValue : null;
            }).filter(function (cur) {
                return !!cur;
            });
            if (selected.length) {
                variations.push(v.displayName + ': ' + selected.join(', '));
            }
        }
    });

    return variations.sort().join(', ');
}

exports.afterFooter = afterFooter;
