'use strict';

$('.form-control').on('blur', function (e) {
    if ($(this).hasClass('is-invalid')) {
        $(this).removeClass('is-invalid');
    }
});