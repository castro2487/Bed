/* global $, google */
'use strict';

var geocoder;
// eslint-disable-next-line no-undef
geocoder = new google.maps.Geocoder();

/**
 * appends params to a url
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended parameters
 */
function appendToUrl(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return newUrl;
}

/**
 * returns earliest delivery date for an address
 * @param {Object} addressValues - Address object
 */
// eslint-disable-next-line no-unused-vars
function getEarliestDeliveryDate(addressValues) {
    var url = $('.zenkraft_estimated_delivery_pdp').data('dateurl');
    var urlParams = addressValues;

    url = appendToUrl(url, urlParams);

    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            $.spinner().stop();
            var successString = 'Delivery available on ' + data.earliest_date + ' to ' + addressValues.city + ', ' + addressValues.stateCode;
            $('.estimated-delivery-container').html('<div class="col-12">' + successString + '</div>');
        }
    });
}

function codeLatLng(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'latLng': latlng }, function(results, status) {
        var objAddress = {};

        if (status == google.maps.GeocoderStatus.OK) {

            if (results[1]) {
                var city;
                var state;
                var postal;
                var country;

        // find state name
                for (var i=0; i<results[0].address_components.length; i++) {
                    for (var b=0;b<results[0].address_components[i].types.length;b++) {

                // there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                    // this is the object you are looking for
                            state= results[0].address_components[i];
                            break;
                        }
                    }
                }

        // find city name
                for (var i=0; i<results[0].address_components.length; i++) {
                    for (var b=0;b<results[0].address_components[i].types.length;b++) {
                // there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] == "locality" || results[0].address_components[i].types[b] == "postal_town") {
                    // this is the object you are looking for
                            city= results[0].address_components[i];
                            break;
                        }
                    }
                }

        // find postal code
                for (var i=0; i<results[0].address_components.length; i++) {
                    for (var b=0;b<results[0].address_components[i].types.length;b++) {
                // there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] == "postal_code") {
                    // this is the object you are looking for
                            postal= results[0].address_components[i];
                            break;
                        }
                    }
                }

        // find country code
                for (var i=0; i<results[0].address_components.length; i++) {
                    for (var b=0;b<results[0].address_components[i].types.length;b++) {
                // there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] == "country") {
                    // this is the object you are looking for
                            country= results[0].address_components[i];
                            break;
                        }
                    }
                }

        // city data
                objAddress.city = city.long_name;
                objAddress.stateCode = state.short_name;
                objAddress.postalCode = postal.long_name;
                objAddress.countryCode = country.short_name;

                $('.zenkraft_estimated_delivery_pdp').show();

            } else {
                alert("No results found");
            }
        } else {
            alert("Geocoder failed due to: " + status);
        }
    });
}

function getGeoAddressFromGoogleObject(place) {
    var objAddress = {
        address1: place.name,
        city: '',
        stateCode: '',
        postalCode: '',
        countryCode: ''
    };

    for (var i=0; i<place.address_components.length; i++) {
        for (var b=0;b<place.address_components[i].types.length;b++) {
            // find state name - there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
            if (place.address_components[i].types[b] == "administrative_area_level_1" && objAddress.stateCode.length == 0) {
                objAddress.stateCode = place.address_components[i].short_name;
            }
            // find city name
            if ((place.address_components[i].types[b] == "locality" || place.address_components[i].types[b] == "postal_town" || place.address_components[i].types[b] == "sublocality_level_1") && objAddress.city.length == 0) {
                objAddress.city = place.address_components[i].long_name;
            }
             // find postal code
            if (place.address_components[i].types[b] == "postal_code" && objAddress.postalCode.length == 0) {
                objAddress.postalCode = place.address_components[i].long_name;
            }
            // find country code
            if (place.address_components[i].types[b] == "country" && objAddress.countryCode.length == 0) {
                objAddress.countryCode = place.address_components[i].short_name;
            }
            if (objAddress.stateCode.length > 0 && objAddress.city.length > 0 && objAddress.postalCode.length > 0 && objAddress.countryCode.length > 0) {
                break;
            }
        }
    }

    return objAddress;
}

function getFormatedPrice(currency, totalCost) {
    var thisCurrency = currency;
    var thisTotalCost = totalCost;
    if (thisCurrency.toLowerCase() === 'usd') {
        thisCurrency = '$';
    } else if (thisCurrency.toLowerCase() === 'eur') {
        thisCurrency = '€';
    }
    if (thisTotalCost.indexOf('.') > -1) {
        var splitedPrice = totalCost.split('.');
        if (splitedPrice.length === 2 && splitedPrice[1].length === 1) {
            thisTotalCost += '0';
        }
    }
    return '<span> - ' + thisCurrency + thisTotalCost + '</span>';
}

function initEvents() {
    $('.get-estimated-delivery').click(function() {
        $.spinner().start();

        if (!navigator.geolocation) {
            $.spinner().stop();
            return;
        }

        navigator.geolocation.getCurrentPosition(function (position) {
            codeLatLng(position.coords.latitude, position.coords.longitude);
        });
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            codeLatLng(position.coords.latitude, position.coords.longitude);
        }, function error() {
            $('.geo-address-msg').hide();
            $('.zenkraft_estimated_delivery_pdp').show();
        });
    } else {
        // browser not allowing geolocation
        $('.zenkraft_estimated_delivery_pdp').show();
    }

    // bind address autocomplete for EDD search to window.autocomplete
    var searchInput = $('#zk_location')[0];
    var autocomplete = new google.maps.places.Autocomplete(searchInput);

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        $('.zenkraft_estimated_delivery_pdp').spinner().start();
        var place = autocomplete.getPlace();
        var productID = $('.container.product-detail').data('pid');
        var url = $('.zenkraft_estimated_delivery_pdp').data('methodurl');
        var address = {};
        var reqdata = {};

        try {
            $('.stage1').find('.error').remove();
            address = getGeoAddressFromGoogleObject(place);
        } catch (error) {
            $('.stage1').append('<p class="error text-danger">Please enter your full address. </p>')
            $('.zenkraft_estimated_delivery_pdp').spinner().stop();
            return;
        }

        reqdata = {
            pid: productID,
            address1: address.address1,
            countryCode: address.countryCode,
            stateCode: address.stateCode,
            postalCode: address.postalCode,
            city: address.city
        };
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: url,
            contentType: 'application/json',
            data: reqdata
        })
        .done(function (response) {
            var html = '';
            if (response.shipMethods) {
                response.shipMethods.forEach(function (method) {
                    html += '<div class="row mt-2"><div class="col-1 col-lg-1 ">';
                    html += '<input type="radio" id="edd-ship-selection" name="edd-shipping-option" value="' + method.ID + '"/></div>';
                    html += '<div class="col-11 col-lg-11 ">';
                    html += method.displayName;

                    if (method.estimatedArrivalTime) {
                        html += ' - <span style="color:#0F7E11"> ' + method.estimatedArrivalTime + '</span>';
                    }
                    if (method.currency && method.totalCost) {
                        html += getFormatedPrice(method.currency, method.totalCost);
                    }
                    html += '</div></div>';
                });
                html += '<hr>';
                $('.stage2').append(html);
            }
            $('.zenkraft_estimated_delivery_pdp').spinner().stop();
        });

        if (place.formatted_address.includes("China")) {
            $('.stage1').css('display','none')
            $('.stage3').css('display','block')
        } else {
            $('.stage1').css('display','none')
            $('.stage2').css('display','block')
        }

        $('#pref-save-address').val(place.formatted_address)


        $('.destination').html(place.formatted_address);
    });

    $('body').on('product:afterAddToCart', function (event, data) {
        var shippingUrl = data.cart.actionUrls.selectShippingUrl;
        var selectedID = $('input[name="edd-shipping-option"]:checked').val();
        var urlParams = {
            methodID: selectedID
        };

        $.ajax({
            url: shippingUrl,
            type: 'post',
            dataType: 'json',
            data: urlParams,
            success: function (data) {
            }
        });
    });
}

function setCountdown() {
    var countDown = new Date();
    countDown.setHours(20, 0, 0);
    var countDownDate = countDown.getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

    // Get today's date and time
        var nowDate = new Date();
        var now = nowDate.getTime();

    // Find the distance between now and the count down date
        var distance = countDownDate - now;

    // if we have passed the countdown date, countdown to tomorrow
        if (distance <= 0) {
            countDown.setDate(countDown.getDate() + 1);
            countDownDate = countDown.getTime();
            distance = countDownDate - now;
        }

    // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result
        $('.time-countdown').text('within ' + hours + "h "
    + minutes + "m " + seconds + "s ");

    // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
        }
    }, 1000);
}

initEvents();
setCountdown();
