'use strict';

var scrollAnimate = require('./scrollAnimate');

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for email sign-up
 */
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.email-signup-message').length === 0) {
        $('body').append(
           '<div class="email-signup-message"></div>'
        );
    }
    $('.email-signup-message')
        .append('<div class="email-signup-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.email-signup-message').remove();
        button.removeAttr('disabled');
    }, 3000);
}

module.exports = function () {
/*     $('.back-to-top').click(function () {
        var element = $('.grid-header');
        scrollAnimate(element);
    }); */

    var showSplashCountrySelectorOnPageLoad = $('.modal-splash-container').data('show-language-selector');
    if (showSplashCountrySelectorOnPageLoad) {
        $("#splash-modal").modal('show');
        $('.modal-splash-container').attr('data-show-language-selector', null);
    }

    $('#splash-modal-close').on('click', function () {
        $('.continent-locale-list.collapse').collapse('hide');
    });

    $('body').on('click', '.back-to-top', function () {
        var element = $('.grid-header');
        scrollAnimate(element);
    });

    $('.subscribe-email').on('click', function (e) {
        e.preventDefault();
        var url = $(this).data('href');
        var button = $(this);
        var emailId = $('input[name=hpEmailSignUp]').val();
        $.spinner().start();
        $(this).attr('disabled', true);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: {
                emailId: emailId
            },
            success: function (data) {
                displayMessage(data, button);
            },
            error: function (err) {
                displayMessage(err, button);
            }
        });
    });

    $('.has-newsletter-footer form').on('submit', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        var button = $(this);
        var email = $('#newsletter-input').val();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: {
                email: email
            },
            success: function (data) {
                // inject email in subscription confirmation pop-up
                $('.has-email').html(email);

                // hide subscribe form and show subscription confirmation
                animateNewsletterSteps($('.has-newsletter-form-footer'), $('.has-newsletter-confirmation-footer'));

                // show subscribe form and hide subscription confirmation
                setTimeout(function () {
                    $('#newsletter-input').val('');
                    animateNewsletterSteps($('.has-newsletter-confirmation-footer'), $('.has-newsletter-form-footer'));
                }, 15 * 1000);

                $('body').trigger('hastens:newsletterRequestSent');
            },
            error: function (err) {
            }
        });
    });

    function animateNewsletterSteps($from, $to) {
        var $container = $('.has-newsletter-footer');
        $container.css({ height: $container.outerHeight(), overflow: 'hidden' });
        $from.css({ opacity: 0 });
        setTimeout(function () {
            $from.hide();
            $to.show().css({ opacity: 0 });
            $container.css({ height: $to.outerHeight() });
            setTimeout(function () {
                $to.css({ opacity: 1 });
                setTimeout(function () {
                    $container.css({ height: '', overflow: '' });
                }, 200);
            }, 400);
        }, 200);
    }

    // if request-catalog is in page scroll to it
    $('#request-catalog-link').on('click', function (e) {
        if ($('#request-catalog').length > 0) {
            $("#request-catalog")[0].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            e.preventDefault();
        }
    });

    function validateEmail(email) {
        var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
        return regex.test(email);
    }

    // enable sign-up button if the input email is syntactically corrent and vice versa
    $('#newsletter-input').on('input', function (e) {
        var email = $('#newsletter-input').val()
        var isValidEmailid = validateEmail(email);

        if (isValidEmailid) {
            $('#newsletter-button').prop('disabled', false);
        } else {
            $('#newsletter-button').prop('disabled', true);
        }
    });


    //old language dropdown toggle logic
    /* if($(window).width() >= 1024 && $(window).width() < 1200) {
        let clicked = 0;
        var dropdown = document.querySelector('footer .custom-footer-dropdown .dropdown-toggle');
        if(dropdown) {
            dropdown.addEventListener('click', function() {
                if(clicked > 0) {
                    this.parentNode.classList.toggle('show');
                    this.nextElementSibling.classList.toggle('show');
                }
                clicked++;
            });
        }
    } else if($(window).width() < 1024) {
        var dropdown = document.querySelector('footer .custom-footer-dropdown .dropdown-toggle');
        if(dropdown) {
            dropdown.addEventListener('click', function() {
                this.parentNode.classList.toggle('show');
                this.nextElementSibling.classList.toggle('show');
            });
        }
    } */

    $('.custom-footer-dropdown').on('click', function () {
        $(this).toggleClass('show');
        $('.dropdown-country-selector').toggleClass('show');
    });
};
