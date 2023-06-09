'use strict';

/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
    var $updates = $results.find(selector);
    $(selector).empty().html($updates.html());
}

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
    $('.refinement.active').each(function () {
        $(this).removeClass('active');
        var activeDiv = $results.find('.' + $(this)[0].className.replace(/ /g, '.'));
        activeDiv.addClass('active');
        activeDiv.find('button.title').attr('aria-expanded', 'true');
    });

    updateDom($results, '.refinements');

    $('.refinements').find('.fa-check-square').each(function (index) {
        this.closest('.card-body').classList.add('show');
        this.closest('.card-body').parentNode.firstElementChild.firstElementChild.classList.remove('collapsed');
        this.closest('.card-body').parentNode.firstElementChild.firstElementChild.setAttribute("aria-expanded", "true");
    });
    $('.refinements').find('.swatch-circle.color-value.selected').each(function (index) {
        this.closest('.card-body').classList.add('show');
        this.closest('.card-body').parentNode.firstElementChild.firstElementChild.classList.remove('collapsed');
        this.closest('.card-body').parentNode.firstElementChild.firstElementChild.setAttribute("aria-expanded", "true");
    });
    if ($('.refinement-bar').height() > $('.product-grid').height()) {
        $('.grid-footer').removeClass('veiled');
    } else {
        $('.grid-footer').addClass('veiled');
    }
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
    var $results = $(response);
    var specialHandlers = {
        '.refinements': handleRefinements
    };

    // Update DOM elements that do not require special handling
    [
        '.grid-header',
        '.header-bar',
        '.header.page-title',
        '.product-grid',
        '.show-more',
        '.filter-bar'
    ].forEach(function (selector) {
        updateDom($results, selector);
    });

    Object.keys(specialHandlers).forEach(function (selector) {
        specialHandlers[selector]($results);
    });
}

function handleBodyOverflow() {
    $('.filter-results').click(function () {
        $('body').css('overflow', 'hidden');
    });

    $('.filter-header .close').click(function () {
        $('body').css('overflow', 'auto');
    });
}

/**
 * This function retrieves another page of content to display in the content search grid
 * @param {JQuery} $element - the jquery element that has the click event attached
 * @param {JQuery} $target - the jquery element that will receive the response
 * @return {undefined}
 */
function getContent($element, $target) {
    var showMoreUrl = $element.data('url');
    $.spinner().start();
    $.ajax({
        url: showMoreUrl,
        method: 'GET',
        success: function (response) {
            $target.append(response);
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
    var $tempDom = $('<div>').append($(response));
    var sortOptions = $tempDom.find('.grid-footer').data('sort-options').options;
    sortOptions.forEach(function (option) {
        $('option.' + option.id).val(option.url);
    });
}

module.exports = {
    filter: function () {
        // Display refinements bar when Menu icon clicked
        $('.container').on('click', 'button.filter-results', function () {
            $('.refinement-bar, .modal-background').show();
            $('.refinement-bar').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', true);
            $('.refinement-bar .close').focus();
        });
    },

    closeRefinements: function () {
        // Refinements close button
        $('.container').on('click', '.refinement-bar button.close, .modal-background', function () {
            $('.refinement-bar, .modal-background').hide();
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
            $('.btn.filter-results').focus();
        });
    },

    resize: function () {
        // Close refinement bar and hide modal background if user resizes browser
        $(window).resize(function () {
            $('.refinement-bar, .modal-background').hide();
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
        });
    },

    sort: function () {
        // Handle sort order menu selection
        $('.container').on('change', '[name=sort-order]', function (e) {
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:sort', this.value);
            $.ajax({
                url: this.value,
                data: { selectedUrl: this.value },
                method: 'GET',
                success: function (response) {
                    $('.product-grid').empty().html(response);
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    },

    showMore: function () {
        // Show more products
        $('.container').on('click', '.show-more button', function (e) {
            console.log('show me more!');
            e.stopPropagation();
            var showMoreUrl = $(this).data('url');
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:showMore', e);
            $.ajax({
                url: showMoreUrl,
                data: { selectedUrl: showMoreUrl },
                method: 'GET',
                success: function (response) {
                    $('.grid-footer').replaceWith(response);
                    updateSortOptions(response);
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    },

    applyFilter: function () {
        // Handle refinement value selection and reset click
        $('.container').on(
            'click',
            '.refinements li button, .refinement-bar button.reset, .filter-value button, .swatch-filter button',
            function (e) {
                e.preventDefault();
                e.stopPropagation();

                $.spinner().start();
                $(this).trigger('search:filter', e);
                $.ajax({
                    url: $(this).data('href'),
                    data: {
                        page: $('.grid-footer').data('page-number'),
                        selectedUrl: $(this).data('href')
                    },
                    method: 'GET',
                    success: function (response) {
                        parseResults(response);
                        handleBodyOverflow();
                        $.spinner().stop();
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            });
    },

    showContentTab: function () {
        // Display content results from the search
        $('.container').on('click', '.content-search', function () {
            if ($('#content-search-results').html() === '') {
                getContent($(this), $('#content-search-results'));
            }
        });

        // Display the next page of content results from the search
        $('.container').on('click', '.show-more-content button', function () {
            getContent($(this), $('#content-search-results'));
            $('.show-more-content').remove();
        });
    },

    colorAttribute: function () {
        var currentImg;
        $(document).on('mouseenter', '.color-swatches a', function (e) {
            var swatchLink = $(e.currentTarget).data('image')
            var $productContainer = $(this).closest('.product-tile');

            currentImg = $($productContainer).find('.tile-image').attr('src');
            $($productContainer).find('.tile-image').attr('src', swatchLink);
        });
        $(document).on('mouseleave', '.color-swatches a', function (e) {
            var $productContainer = $(this).closest('.product-tile');

            $($productContainer).find('.tile-image').attr('src', currentImg);
        });
    },

    plpAnimations: function () {
        const images = document.querySelectorAll('.product-tile .image-container a div .tile-image');
        images.forEach(s => {
            $(s).hover(
                function () {
                    $(s).addClass('on-it');
                    s.parentNode.parentNode.parentNode.nextElementSibling.querySelector('.pdp-link a span').classList.add('on-it');
                }, function () {
                    $(s).removeClass('on-it');
                    s.parentNode.parentNode.parentNode.nextElementSibling.querySelector('.pdp-link a span').classList.remove('on-it');
                }
            );
        });

        const links = document.querySelectorAll('.product-tile .tile-body .pdp-link a span');
        links.forEach(l => {
            $(l).hover(
                function () {
                    $(l).addClass('on-it');
                    l.parentNode.parentNode.parentNode.parentNode.querySelector('a .tile-image').classList.add('on-it');
                }, function () {
                    $(l).removeClass('on-it');
                    l.parentNode.parentNode.parentNode.parentNode.querySelector('a .tile-image').classList.remove('on-it');
                }
            );
        });
    }
};
