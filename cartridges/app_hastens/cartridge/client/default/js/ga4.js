$(document).ready(function () {
    $('body').on('hastens:afterAddToCart', function (event, response) {
        const addedItem = response.data.cart.items.find(function (item) {
            return item.id == response.pid;
        });
        addedItem.quantity = response.quantity;

        // GA4
        window.dataLayer.push({
            event: 'add_to_cart',
            ecommerce: generateGA4ItemData([addedItem])
        });

        // UA
        window.dataLayer.push({
            event: 'eec.add',
            ecommerce: {
                add: {
                    actionField: {
                        list: 'Product Page'
                    },
                    products: generateUAItemData([addedItem])
                }
            }
        })
    });
    $('body').on('product:afterAttributeSelect', function (event, response) {
        const category = response.data.breadcrumbs[1] ? response.data.breadcrumbs[1].htmlValue : '';

        // GA4 - skip for now
        // window.dataLayer.push({
        //     event: 'view_item',
        //     ecommerce: generateGA4ItemData([response.data.product], category)
        // });

        // UA
        window.dataLayer.push({
            event: 'eec.detail',
            ecommerce: {
                detail: {
                    products: generateUAItemData([response.data.product], category)
                }
            }
        });
    });
    $('body').on('checkout:serializeBilling', function (event, response) {
        const form = response.form.serializeArray();
        const payment = form.filter(function (item) {
            return item.name === 'adyenPaymentMethod';
        });

        if (payment.length > 0) {
            // GA4
            window.dataLayer.push({
                event: 'add_payment_info',
                ecommerce: {
                    payment_type: payment[0].value
                }
            });

            // UA
            window.dataLayer.push({
                event: 'eec.checkout',
                ecommerce: {
                    checkout: {
                        actionField: {
                            step: '2',
                            option: payment[0].value
                        }
                    }
                }
            });
        }
    });
    $('body').on('hastens:updateShippingMethods', function (event, response) {
        const cost = response.shipping.selectedShippingMethod.shippingCost || '';
        const currency = getCurrency(response.shipping.productLineItems.items);
        const tier = response.shipping.selectedShippingMethod.displayName;
        const data = {
            shipping_tier: tier,
        };

        if (cost) {
            data.value = cleanNumber(cost);
        }
        if (currency) {
            data.currency = currency;
        }

        // GA4
        window.dataLayer.push({
            event: 'add_shipping_info',
            ecommerce: data
        });

        // UA - must trigger after begin_checkout
        window.dataLayer.push({
            event: 'eec.checkout_option',
            ecommerce: {
                checkout_option: {
                    actionField: {
                        step: '1',
                        option: tier
                    }
                }
            }
        });
    });

    /*
    // Currently not triggered
    $('body').on('afterRemoveFromCart', function (event, response) {
        const items = response.cart.items;

        window.dataLayer.push({
            event: 'remove_from_cart',
            ecommerce: generateEcommerceData(items)
        });
    });

    // Maybe needed
    $('body').on('product:statusUpdate', function (event, response) {
        console.log(event, response);
    });
    $('body').on('cart:update', function (event, response) {
        console.log(event, response);
    });
    $('body').on('cart:updateQuantity', function (event, response) {
        console.log(event, response);
    });
    $('body').on('setShippingMethodSelection', function (event, response) {
        console.log(event, response);
    });
    */

    $('body').on('hastens:storeLocatorResultsUpdated', function () {
        window.dataLayer.push({ event: 'storeLocatorSearch' });
    });

    $('body').on('hastens:storeLocatorResultClick', function (event, label) {
        window.dataLayer.push({ event: 'storeLocatorClickOnSearchResults', label: label });
    });

    $('body').on('hastens:storeLocatorMapMarkerClick', function (event, label) {
        window.dataLayer.push({ event: 'storeLocatorClickOnMarker', label: label });
    });

    $('body').on('hastens:newsletterRequestSent', function () {
        window.dataLayer.push({ event: 'signUpForNewsLetter' });
    });

    $('.tid-storelocator-partnerpage').on('click', function() {
        window.dataLayer.push({
            event: 'storeLocatorViewStore',
            label: $(this).data('store'),
        });
    });

    $('.tid-storelocator-phone').on('click', function() {
        window.dataLayer.push({
            event: 'storeLocatorClickOnPhoneNumber',
            label: $(this).data('store'),
            number: $(this).data('number'),
            type: 'location',
        });
    });

    $('.tid-storelocator-direction').on('click', function() {
        window.dataLayer.push({
            event: 'storeLocatorClickOnDirections',
            label: $(this).data('store'),
            type: 'location',
        });
    });

    $('#footercontent .container-social').on('click', 'a', function() {
        var href = $(this).attr('href');

        if (href.indexOf('facebook') !== -1) {
            window.dataLayer.push({ event: 'clickOnSocialMediaIcon', label: 'facebook' });
        } else if (href.indexOf('linkedin') !== -1) {
            window.dataLayer.push({ event: 'clickOnSocialMediaIcon', label: 'linkedin' });
        } else if (href.indexOf('pinterest') !== -1) {
            window.dataLayer.push({ event: 'clickOnSocialMediaIcon', label: 'pinterest' });
        } else if (href.indexOf('youtube') !== -1) {
            window.dataLayer.push({ event: 'clickOnSocialMediaIcon', label: 'youtube' });
        } else if (href.indexOf('instagram') !== -1) {
            window.dataLayer.push({ event: 'clickOnSocialMediaIcon', label: 'instagram' });
        }
    });
});

/**
 * Generate default ecommerce data object with item list and value.
 *
 * Skipping item_id and item_variant since Analytics don't handle them
 * correctly as of now.
 *
 * @param items
 * @param {string} category
 * @returns {object}
 */
function generateGA4ItemData(items, category) {
    let itemData = [];
    let value = 0;
    let currency = '';

    items.forEach(function (item) {
        const category = category || item.primaryCategory ? item.primaryCategory.displayName : '';
        const variant = getVariant(item);
        const data = {
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

    const retVal = {
        items: itemData
    }
    if (currency) {
        retVal.currency = currency;
    }
    if (value > 0) {
        retVal.value = value.toFixed(2);
    }

    return retVal;
}

/**
 * Generate a products array appropriate for UA events.
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
        if (item.price.sales && item.price.sales.value !== null) {
            data.price = item.price.sales.value.toFixed(2);
            data.currency = item.price.sales.currency;
        }
        itemData.push(data);
    });

    return itemData;
}

/**
 * Return a string of all selected variants.
 *
 * @param item
 * @returns {string}
 */
function getVariant(item) {
    if (!item.variationAttributes) {
        return '';
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

/**
 * Extract currency information from item data.
 *
 * @param items
 * @returns {string}
 */
function getCurrency(items) {
    const currencies = items.map(function (item) {
        return item.price && item.price.sales
            ? item.price.sales.currency
            : '';
    });

    return currencies.length > 0 ? currencies[0] : '';
}

/**
 * Change a formatted money string to float.
 *
 * @param {string} num
 * @returns {string}
 */
function cleanNumber(num) {
    return parseFloat(num.replace('.', '').replace(',', '.').replace(/[^0-9.]/, '')).toFixed(2);
}
