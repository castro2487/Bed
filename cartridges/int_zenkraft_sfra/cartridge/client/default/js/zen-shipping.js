/* global $, google */
'use strict';

var shipping = require('app_storefront_base/checkout/shipping');
var addressHelpers = require('app_storefront_base/checkout/address');

var baseObj = shipping;

/**
 * Displays google map
 * @param {Object} mapContainer - container with map attributes
 */
function initMap(mapContainer) {
	// get coords
    var mapBox = $('.dopu-map', mapContainer);
    var lat = mapBox.data('lat');
    var lng = mapBox.data('lng');


	// set map of location
    var latlng = new google.maps.LatLng(Number.parseFloat(lat), Number.parseFloat(lng));
    var bounds = new google.maps.LatLngBounds();

    var mapOptions = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var locmap = new google.maps.Map($('#dopu-map').get(0), mapOptions);

    var marker1 = new google.maps.Marker({ position: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }, map: locmap });
    bounds.extend(marker1.position);

    //locmap.fitBounds(bounds);
    //locmap.setZoom(15);
}

/**
 * Append drop off location data to the shipping form
 * @param {string} data - drop off location
 */
function getDropOffLocationData(data) {
    $('.drop-off-location-data').remove();
    $('form.shipping-form').append('<input type="hidden" name="drop_off_location_data" class="drop-off-location-data"/>');
    $('.drop-off-location-data').val(data);
}

$('input[name$="shippingAddress_addressFields_postalCode"]')
.on('change', function (e) {
    if (baseObj.methods && baseObj.methods.updateShippingMethodList) {
        baseObj.methods.updateShippingMethodList($(e.currentTarget.form));
    } else {
        // eslint-disable-next-line no-undef
        updateShippingMethodList($(e.currentTarget.form));
    }
});

$('body')
.on('shipping:updateShippingMethods', function (e, shippingdata) {
    var selected_method = $("input[name='dwfrm_shipping_shippingAddress_shippingMethodID']:checked");
    var $shipForm = $('#dwfrm_shipping');

    updateShippingMethodUI(shippingdata.shipping);

    $('.change-dopu-link').click(function (e) {
        e.preventDefault();
        $('.shipping-method-list').hide();
        $('.drop-off-location-container').hide();
        $('.drop-off-selection-container').show(0, function () {
            initMap($('.drop-off-selection-container'));
        });
    });

    $('.location-select').click(function (e) {
        e.preventDefault();
        $('.shipping-method-list').hide();
        $('.drop-off-location-container').show();
        $('.drop-off-selection-container').hide();
    });

    $('.select-delivery').click(function (e) {
        e.preventDefault();
        $('.shipping-method-list').show();
        $('.drop-off-location-container').hide();
        $('.drop-off-selection-container').hide();
    });

    $('button.select-location').click(function (e) {
        // find_me
        e.preventDefault();
        var $newValData = $(this).parent().parent().find('.location-data').data('json');
        getDropOffLocationData(JSON.stringify($newValData));
        $('input[name$=_address1]', $shipForm).val($newValData.street1);
        $('input[name$=_city]', $shipForm).val($newValData.city);
        $('input[name$=_postalCode]', $shipForm).val($newValData['postal_code']);

        $('.shipping-method-list').show();
        $('.drop-off-location-container').hide();
        $('.drop-off-selection-container').hide();

        if (baseObj.methods && baseObj.methods.updateShippingMethodList) {
            baseObj.methods.updateShippingMethodList($shipForm);
        } else {
            updateShippingMethodList($shipForm);
        }
    });
});

function updateShippingMethodUI(shipping) {
    var uuidEl = $('input[value=' + shipping.UUID + ']');
    if (uuidEl && uuidEl.length > 0) {
        $.each(uuidEl, function (shipmentIndex, el) {
            var form = el.form;
            if (!form) return;

            var $shippingMethodList = $('.shipping-method-list', form);

            if ($shippingMethodList && $shippingMethodList.length > 0) {
                $shippingMethodList.empty();
                var shippingMethods = shipping.applicableShippingMethods;
                var selected = shipping.selectedShippingMethod || {};
                var shippingMethodFormID = form.name + '_shippingAddress_shippingMethodID';
                //
                // Create the new rows for each shipping method
                //
                $.each(shippingMethods, function (methodIndex, shippingMethod) {
                    // if there is no drop off location for that address does not show the drop off shipping method
                    /* if (shippingMethod.dropOffMethod && shippingMethod.dropOffLocations && shippingMethod.dropOffLocations.length === 0) {
                        return;
                    } */
                    var tmpl = $('#shipping-method-template').clone();

                    // set input
                    $('input', tmpl)
                        .prop('id', 'shippingMethod-' + shippingMethod.ID + '-' + shipping.UUID)
                        .prop('name', shippingMethodFormID)
                        .prop('value', shippingMethod.ID)
                        .attr('checked', shippingMethod.ID === selected.ID);

                    if (shippingMethod.ID === selected.ID) {
                        $('.ship-method-row', tmpl).addClass('selected');
                    }

                    if ('displayImage' in shippingMethod && shippingMethod.displayImage !== null) {
                        $('.method-image', tmpl).attr('style', 'background-image:url(' + shippingMethod.displayImage + ')');
                    }

                    if ('zenkraftID' in shippingMethod) {
                        if (shippingMethod.zenkraftID.toLowerCase().indexOf('dhl') > -1) {
                            $('.ship-method-row', tmpl).addClass('method-dhl');
                        }

                        if (shippingMethod.zenkraftID.toLowerCase().indexOf('fedex') > -1) {
                            $('.ship-method-row', tmpl).addClass('method-fedex');
                        }

                        if (shippingMethod.zenkraftID.toLowerCase().indexOf('ups') > -1) {
                            $('.ship-method-row', tmpl).addClass('method-ups');
                        }
                    }

                    $('label', tmpl)
                        .prop('for', 'shippingMethod-' + shippingMethod.ID + '-' + shipping.UUID);

                    // set shipping method name
                    $('.display-name', tmpl).text(shippingMethod.displayName);

                    // set or hide arrival time
                    if (shippingMethod.estimatedArrivalTime) {
                        $('.arrival-time', tmpl)
                            .text(shippingMethod.estimatedArrivalTime)
                            .show();
                    }

                    if (shippingMethod.dropOffMethod) {
                        var doputmpl = $('#dopu-template').clone();
                        var dopuSeltmpl = $('#dopu-selection-template').clone();

                        var $dopuContainer = $('.drop-off-location-container');
                        var $dopuSelContainer = $('.drop-off-selection-container');
                        var hoursObjectKey;

                        $dopuContainer.empty();
                        $dopuSelContainer.empty();

                        $('.ship-method-row', tmpl)
                            .addClass('drop-off-method');

                        $('.method-detail-area', tmpl)
                            .addClass('dopu-select-area');

                        $('.change-dopu-link', tmpl)
                            .text(' - Change');

                        // populate currently selected location
                        if (shippingMethod.dropOffLocations && shippingMethod.dropOffLocations.length > 0) {
                            var firstLocation = shippingMethod.dropOffLocations[0];
                            getDropOffLocationData(JSON.stringify(firstLocation));
                            var _distance = Number.parseFloat(firstLocation['distance']);
                            _distance = _distance.toFixed(3);
                            _distance = parseFloat(_distance);

                            $('.dopu-distance-away', tmpl)
                            .text(' - ' + _distance + ' miles away');

                            $('.location-name', dopuSeltmpl)
                            .text(firstLocation['location_name']);
                            $('.location-street1', dopuSeltmpl)
                            .text(firstLocation['street1']);
                            $('.location-city', dopuSeltmpl)
                            .text(firstLocation['city']);
                            $('.location-postal', dopuSeltmpl)
                            .text(firstLocation['postal_code']);

                            $('.location-distance', dopuSeltmpl)
						.text(_distance + ' miles away');

                            var hoursObj = 'operational_hours' in firstLocation ? firstLocation['operational_hours'] : firstLocation['operating_hours'];

                            hoursObjectKey = Object.keys(hoursObj);
                            $('.location-hours-close', dopuSeltmpl)
                            .text(hoursObj[hoursObjectKey[0]]['close']);
                            $('.location-hours-open', dopuSeltmpl)
                            .text(hoursObj[hoursObjectKey[0]]['open']);
                            $('.map-static-image', dopuSeltmpl)
                    	   .attr('src', 'https://maps.googleapis.com/maps/api/staticmap?size=200x200&zoom=15&markers=' + firstLocation.lat + ',' + firstLocation.lng + '&key=AIzaSyDCcV1DGdotTTEgjIGNmWHMiBvpKgtiXUo');

                            var mapContainer = $('.dopu-map', dopuSeltmpl);
                            mapContainer.attr('data-lat', firstLocation.lat);
                            mapContainer.attr('data-lng', firstLocation.lng);
                        }
                        $dopuSelContainer.append(dopuSeltmpl.html());

                        // add other dopu options to select template
                        $.each(shippingMethod.dropOffLocations, function (methodIndex, dopuLocation) {
                            if (methodIndex > 4) {
                                return false;
                            }
                            $('.location-data', doputmpl)
                                .attr('data-json', JSON.stringify(dopuLocation));
                            $('.location-name', doputmpl)
                                .text(dopuLocation['location_name']);

                            var _locdistance = Number.parseFloat(dopuLocation['distance']);
                            _locdistance = _locdistance.toFixed(3);
                            _locdistance = parseFloat(_locdistance);

                            $('.location-distance', doputmpl)
                                .text(_locdistance + ' miles');
                            $('.location-street1', doputmpl)
                                .text(dopuLocation['street1'] + ', ' + dopuLocation.city + ', ' + dopuLocation['postal_code']);
                            $dopuContainer.append(doputmpl.html());
                        });
                    }

                    // set shipping cost
                    $('.shipping-cost', tmpl).text(shippingMethod.shippingCost);
                    $shippingMethodList.append(tmpl.html());
                });
            }
        });
    }
}

$(document).ready(function () {
    if (baseObj.methods && baseObj.methods.selectShippingMethod) {
        baseObj.methods.selectShippingMethod();
    }

    var _postal = $('input[name$="shippingAddress_addressFields_postalCode"]');
    var _state = $('input[name$="shippingAddress_addressFields_states_stateCode"]');

    if (_postal.val() !== '') {
        $('input[name$="shippingAddress_addressFields_postalCode"]').trigger('change');
    }

    $('select[name$="shippingAddress_addressFields_states_stateCode"]').off();

    $('.shipping-method-list').change(function () {
        var $shippingForm = $(this).parents('form');
        var methodID = $(':checked', this).val();
        var shipmentUUID = $shippingForm.find('[name=shipmentUUID]').val();
        var urlParams = addressHelpers.methods.getAddressFieldsFromUI($shippingForm);
        urlParams.shipmentUUID = shipmentUUID;
        urlParams.methodID = methodID;
        urlParams.isGift = $shippingForm.find('.gift').prop('checked');
        urlParams.giftMessage = $shippingForm.find('textarea[name$=_giftMessage]').val();

        var url = $(this).data('select-shipping-method-url');

        if (baseObj.methods && baseObj.methods.selectShippingMethodAjax) {
            baseObj.methods.selectShippingMethodAjax(url, urlParams, $(this));
        } else {
            selectShippingMethodAjax(url, urlParams, $(this));
        }
    });
});
