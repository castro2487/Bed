/**
 * Trigger confirmation when user accepts/rejects
 */

$(document).on('click', '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection, #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', function() {
    var $confirmation = $('<div />').addClass('cookie-accept-confirmation').append(
        $('<div />').addClass('content-wrapper').append(
            $('<h2 />').text(window.hastens_globals.cookieAcceptHeading),
            $('<p />').text(window.hastens_globals.cookieAcceptBody),
        ),
    );

    $('body').append($confirmation);
    setTimeout(function() {
        $confirmation.fadeOut(400, function() {
            $confirmation.remove();
        });
    }, 4000);
});

$(document).on('click', '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll', function() {
    var $confirmation = $('<div />').addClass('cookie-reject-confirmation').append(
        $('<div />').addClass('content-wrapper').append(
            $('<h2 />').text(window.hastens_globals.cookieRejectHeading),
            $('<p />').text(window.hastens_globals.cookieRejectBody),
        ),
    );

    $('body').append($confirmation);
    setTimeout(function() {
        $confirmation.fadeOut(400, function() {
            $confirmation.remove();
        });
    }, 4000);
});

/**
 * Trigger close when user accepts/rejects
 */

$(document).on('click', '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection, #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll', function() {
    $('body').removeClass('cookiebanner-open');
});

/**
 * Rearrange cookie details
 */

$(document).ready(function() {
    var $details = $('<div />')
        .append(
            $('<h3 />').text($('#CybotCookiebotDialogDetailBodyContentCookieContainerNecessary').text().trim()),
            $('<p />').text($('#CybotCookiebotDialogDetailBodyContentCookieTabsNecessary .CybotCookiebotDialogDetailBodyContentCookieTypeIntro').text()),
            $('<a />').attr('href', window.hastens_globals.cookieSettingsLinkUrl + '#category1').text(window.hastens_globals.cookieSettingsLinkText),

            $('<h3 />').text($('#CybotCookiebotDialogDetailBodyContentCookieContainerPreference').text().trim()),
            $('<p />').text($('#CybotCookiebotDialogDetailBodyContentCookieTabsPreference .CybotCookiebotDialogDetailBodyContentCookieTypeIntro').text()),
            $('<a />').attr('href', window.hastens_globals.cookieSettingsLinkUrl + '#category2').text(window.hastens_globals.cookieSettingsLinkText),

            $('<h3 />').text($('#CybotCookiebotDialogDetailBodyContentCookieContainerStatistics').text().trim()),
            $('<p />').text($('#CybotCookiebotDialogDetailBodyContentCookieTabsStatistics .CybotCookiebotDialogDetailBodyContentCookieTypeIntro').text()),
            $('<a />').attr('href', window.hastens_globals.cookieSettingsLinkUrl + '#category3').text(window.hastens_globals.cookieSettingsLinkText),

            $('<h3 />').text($('#CybotCookiebotDialogDetailBodyContentCookieContainerAdvertising').text().trim()),
            $('<p />').text($('#CybotCookiebotDialogDetailBodyContentCookieTabsAdvertising .CybotCookiebotDialogDetailBodyContentCookieTypeIntro').text()),
            $('<a />').attr('href', window.hastens_globals.cookieSettingsLinkUrl + '#category4').text(window.hastens_globals.cookieSettingsLinkText),
        );

    $('#CybotCookiebotDialogDetailBody').html($details.html());
    $('body').addClass('cookiebanner-open');
});
