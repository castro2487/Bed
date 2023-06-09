'use strict';

/**
 * Check if the given form data is regarded as spam. Send in the current
 * controller request and a comment object with these fields.
 *
 *      const comment = {
 *          comment_type: 'contact_form',
 *          comment_author: contactusform.firstname.value + ' ' + contactusform.lastname.value,
 *          comment_author_email: contactusform.email.value,
 *          comment_content: contactusform.comment.value,
 *      };
 *
 * @param req Current request
 * @param comment Comment data as above
 * @param name Form name for logging
 * @returns {boolean} True if the form is valid, false if it is spam
 */
function validateForm(req, comment, name) {
    let commentData = {
        blog: req.httpHeaders['origin'],
        user_ip: req.httpHeaders['true-client-ip'],
        user_agent: req.httpHeaders['user-agent'],
        referrer: req.httpHeaders['referer']
    };

    // Object.assign() is not available here
    for (var x in comment) {
        commentData[x] = comment[x];
    }

    const service = getService('hastens.akismet.comment-check');
    if (!service) {
        // If the service can't be created we always keep the message
        return true;
    }

    service.addHeader('Content-type', 'application/x-www-form-urlencoded');
    service.addHeader('User-Agent', 'Salesforce/19.10 | Akismet/3.1.7');

    const res = service.call(commentData);

    if (res.ok === true) {
        const isSpam = res.object && res.object.text !== 'false';
        if (isSpam) {
            logSpam(name, commentData);
        }

        return !isSpam;
    }

    // If the service fails we always keep the message
    return true;
}

function getService(serviceName) {
    let service = null;

    try {
        service = dw.svc.LocalServiceRegistry.createService(serviceName, {
            createRequest: function (svc: HTTPService, comment) {
                svc.setRequestMethod('POST');
                return Object.keys(comment).map(function (key) {
                    return key + '=' + encodeURIComponent(comment[key]);
                }).join('&');
            },
            parseResponse: function (svc: HTTPService, client) {
                return client;
            },
            filterLogMessage: function (msg) {
                return msg;
            },
        });
    } catch (e) {
        dw.system.Logger.getLogger('Hastens', 'formValidator')
            .error('Failed getting Akismet service');
    }

    return service;
}

/**
 * Save the spam data somewhere, so it does not get lost.
 *
 * @todo Maybe send as email so Hästens can see it.
 *
 * @param name
 * @param commentData
 */
function logSpam(name, commentData) {
    dw.system.Logger.getLogger('Spam', 'Spam')
        .warn('Form: {0}, Data: {1}', name, JSON.stringify(commentData));
}

// Exports =====================================================================

module.exports = {
    validateForm: validateForm,
};