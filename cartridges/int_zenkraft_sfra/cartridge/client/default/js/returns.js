"use strict";


function initEvents() {
    var locationBody;

    function showSelectItems() {
        $('.js-select-return-items').show();
        $('.js-select-return-reasons').hide();
        $('.js-button-returns-back').hide();
        $('.js-button-returns-next').show();
        $('.js-label-step, .js-reasons-step')
            .find('.js-progress-rectangle, .js-progress-triangle')
            .removeClass('active');
        $('.js-select-items-step')
            .find('.js-progress-rectangle, .js-progress-triangle')
            .addClass('active');
    }

    function showReasons() {
        $('.js-select-return-items').hide();
        $('.js-return-label').hide();
        $('.js-button-returns-back').show();
        $('.js-button-returns-next').show();
        $('.js-checkbox-return-item:not(:checked)').each(function(item) {
            var orderItemID = this.id;
            $('.js-reason-line[data-orderitemid="' + orderItemID + '"]').hide();
        })
        $('.js-checkbox-return-item:checked').each(function(item) {
            var orderItemID = this.id;
            $('.js-reason-line[data-orderitemid="' + orderItemID + '"]').show();
        })
        $('.js-select-return-reasons').show();
        $('.js-select-items-step, .js-label-step')
            .find('.js-progress-rectangle, .js-progress-triangle')
            .removeClass('active');
        $('.js-reasons-step')
            .find('.js-progress-rectangle, .js-progress-triangle')
            .addClass('active');
    }

    function showLabel() {
        $('.js-select-return-reasons').hide();
        $('.js-button-returns-next').hide();
        $('.js-return-label').show();
        $('.js-select-items-step, .js-reasons-step')
            .find('.js-progress-rectangle, .js-progress-triangle')
            .removeClass('active');
        $('.js-label-step')
            .find('.js-progress-rectangle')
            .addClass('active');
    }

    function handleSelectItems() {
        var $selectedItems = $('.js-checkbox-return-item:checked');
        if ($selectedItems.length) {
            showReasons();
        } else {
            $('.invalid-feedback').show();
        }
    }

    function getNearestDropOffLocation(locationURL, locationBody) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: locationURL,
            contentType: 'application/json',
            data: locationBody
        })
        .done(function (response) {
            var $loader = $('.location-progress');
            var $nearest = $('.nearest-location');
            var $address = $('.nearest-location');
            var $distance = $address.find('.nearest-loc-distance');
            var $street = $address.find('.nearest-loc-address-street');
            var $city = $address.find('.nearest-loc-address-city');
            var $postal = $address.find('.nearest-loc-address-postal');

            if (!response.error) {
                // populate the location info
                $distance.html(response.distance + ' ' + response.distance_units);
                $street.html(response.street1);
                $city.html(response.city);
                $postal.html(response.postal_code);

                // set up the map
                var latlng = new google.maps.LatLng(response.lat,response.lng);
                var bounds = new google.maps.LatLngBounds();
                var latNumber = parseFloat(response.lat);
                var lngNumber = parseFloat(response.lng)

                var mapOptions = {
                        zoom: 15,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                // init map
                var locmap = new google.maps.Map($('.return-map-container').get(0), mapOptions);

                // set marker
                var marker1 = new google.maps.Marker({position: {lat: latNumber, lng: lngNumber}, map: locmap});

                // hide loader
                $loader.hide();

                // show location info
                $nearest.show();
            } else {
                $('.location-progress').html(response.error);
            }
        });
    }

    function displayRetrunLabel() {
        $(document).ready(function() {
            if($('#approved-return-case-data').length > 0) {
                showLabel()
                var dataItem = $('#approved-return-case-data')
                var locationBody = JSON.stringify({
                    address: {
                        postalCode: dataItem.data('postalcode'),
                        city: dataItem.data('city'),
                        countryCode: {
                            value: dataItem.data('countrycode')
                        },
                        stateCode: dataItem.data('statecode'),
                        address1: dataItem.data('street1')
                    }
                });
                console.log( dataItem.data());
                var labelBase64src = "data:application/pdf;base64," + dataItem.data('alllabels').split(',')[0];
                labelBase64src = labelBase64src.replace(/\r?\n|\r/g, "");
                $('.return-label-download').attr('href', labelBase64src);
                $('.sample-label-image').show();
                var locationURL = dataItem.data('locationurl');
                getNearestDropOffLocation(locationURL, locationBody);
            }
        })
    }
    displayRetrunLabel();


    function handleSelectReasons() {
        /* $('.card').spinner().start(); */

        var url = $('.js-button-returns-next').data('url');
        var locationURL = $('.js-button-returns-next').data('locationurl');
        var orderID = $('.js-button-returns-next').data('orderid');

        var $selectedLineItems =  $('.js-reason-line:visible');
        var items = $selectedLineItems
            .filter(function() {
                var $this = $(this);
                var reasonCode = $this.find('.js-reason').val();
                if (!reasonCode || reasonCode === 'not-selected') { return false; }
                var subReasonEl = $this.find('.js-sub-reason:visible');
                if (subReasonEl.length !== 1) { return false; }
                return subReasonEl.val();
            })
            .map(function() {
                var $this = $(this);
                return {
                    productID: $this.data('itemid'),
                    orderItemID: $this.data('orderitemid'),
                    reasonCode:  $this.find('.js-reason').val(),
                    subReasonCode:  $this.find('.js-sub-reason:visible').val(),
                    quantity: $this.find('.js-return-quantity').val(),
                };
            })
            .get();

        if(items.length !== $selectedLineItems.length) {
            $('.label-error').show();
           /*  $('.card').spinner().stop(); */
        }

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                items:items,
                orderID:orderID
            })
        })
        .done(function (response) {
            var newurl =  window.location.href;
            if (newurl.indexOf('?id=') == -1) {
                newurl =  newurl + '?id=' + response.returnID;
            }
            window.history.pushState({ path: newurl }, '', newurl);
            if (response.returnsRequireApproval) {
                $('.display-return-label').html(
                    '<h1>Thank you for your request</h1>' +
                    '<p>Our customer service team have received your request.</br>' +
                    'Once your return is approved you will receive an email with</br> a link to download a shipping label.</p>'
                );
                $('.js-button-returns-back').hide();
                return showLabel();
            }
            var labelBase64src = "";
            var labeltype = "";

            $('.card').spinner().stop();
            if (response.error) {
                throw new Error('Unable to get label');
            }

            labeltype = response.shipment.label_type.toLowerCase();

            if (labeltype === "pdf") {
                labelBase64src = "data:application/pdf;base64," + response.shipment.packages[0].label;
                labelBase64src = labelBase64src.replace(/\r?\n|\r/g, "");
                $('.sample-label-image').show();
            } else {
                labelBase64src = "data:image/" + labeltype + ";base64," + response.shipment.packages[0].label;
                $('.label-image img').attr('src', labelBase64src);
            }
            //$('.label-image img').attr('src', labelBase64src);
            $('.return-label-download').attr('href', labelBase64src);

            showLabel();

            // Get nearest location based on ship from address on order
            locationBody = JSON.stringify({
                address: {
                    postalCode: response.shipment.sender.postal_code,
                    city: response.shipment.sender.city,
                    countryCode: {
                        value: response.shipment.sender.country
                    },
                    stateCode: response.shipment.sender.state,
                    street1: response.shipment.sender.street1
                }
            });
            getNearestDropOffLocation(locationURL, locationBody);
        });
    }

    $('.js-button-returns-next').click(function() {
        $('.invalid-feedback').hide();
        if ($('.js-select-return-items').is(':visible')) {
            handleSelectItems();
        } else {
            handleSelectReasons();
        }
    });

    $('.js-button-returns-back').click(function() {
        if ($('.js-return-label').is(':visible')) {
            showReasons();
        } else {
            showSelectItems();
        }
    });
    $('.select-return-reason').change(function(e) {
        e.preventDefault();
        var $lineItem =  $(this).closest('.js-reason-line');
        $lineItem.find('.js-sub-reason.active')
            .removeClass('active')
            .hide()
        var selectedReason = $(this).val();
        $lineItem.find('.js-sub-reason-' + selectedReason)
            .addClass('active')
            .show();
    });

    $('button.btn-show-more-locations').click(function() {
        var url = $(this).data('url');

            $('.card').spinner().start();

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: url,
                contentType: 'application/json',
                data: locationBody
            })
            .done(function (response) {
                var html = '';
                const keys = Object.keys(response);
                for (const key of keys) {
                    var thisLocation = response[key];
                    console.log(JSON.stringify(response[key]));
                    html += '<div class="location-address">';
                    html += '<div class="distance pull-right"><div>' + thisLocation.distance + ' ' + thisLocation.distance_units + '</div><div><a target="_blank" href=http://www.google.com/maps/place/' + thisLocation.lat + ',' + thisLocation.lng + '>Map</a></div></div>';
                    html += '<div class="address1">' + thisLocation.street1 + '</div>';
                    html += '<div class="city">' + thisLocation.city + ', ' + thisLocation.state + '</div>';
                    html += '<div class="postal">' + thisLocation.postal_code + '</div>';
                    html += '</div>';

                    if(key > 5) {
                        break;
                    }
                }

                $('.more-address-results').html(html);

                $('.card').spinner().stop();
            });
    });
}

$(document).ready(function() {
    initEvents();
});
