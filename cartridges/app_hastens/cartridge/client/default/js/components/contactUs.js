'use strict';

module.exports = function () {
    $('#dwfrm_contactus_myquestion').change(
        function() {
            var orderNumberInput = $('#dwfrm_contactus_ordernumber');
            var orderNumberLabel = orderNumberInput.siblings('.form-control-label');
            var orderNumberText;
            var optionsWithMandatoryOrderNumber = ["Change/Cancel order", "Returns"];
            var selectedOption = $('#dwfrm_contactus_myquestion option:selected').val();
            var mandatoryOrderNumber = optionsWithMandatoryOrderNumber.indexOf(selectedOption) >= 0;

            if (mandatoryOrderNumber) {
                orderNumberInput.attr('aria-required', true);
                orderNumberInput.addClass('required');
                orderNumberInput.parent().addClass('.required');
                orderNumberInput.prop('required', true);
                orderNumberText = orderNumberLabel.text().trim();
                if (orderNumberText.slice(-1) !== '*') {
                    orderNumberLabel.text(orderNumberText + '*');
                }
            } else {
                orderNumberInput.removeAttr('aria-required');
                orderNumberInput.removeClass('required');
                orderNumberInput.parent().removeClass('.required');
                orderNumberInput.removeAttr('required');
                orderNumberText = orderNumberLabel.text().trim();
                if (orderNumberText.slice(-1) === '*') {
                    orderNumberLabel.text(orderNumberText.substring(0, (orderNumberText.length - 1)));
                }
                orderNumberInput.removeClass('is-invalid');
                orderNumberInput.trigger('focusout');
            }
        }
    );
    $('#sendBtn').click(
        function() {
            $('.form-control:visible').trigger('focusout');
            var parsleyErrors = $('.parsley-errors-list.filled');
            if (parsleyErrors.length > 0) {
                parsleyErrors[0].parentElement.scrollIntoView();
            }
        }
    );
};
