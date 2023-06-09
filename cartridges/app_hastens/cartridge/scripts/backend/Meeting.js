'use strict';

const helpers = require('./BackendHelpers');

let Meeting = {
    // Service constants
    SERVICE: {
        BOOK: 'hastens.meeting.book',
        PS_TIME_SLOTS: 'hastens.meeting.ps.time-slots',
        PS_BOOK: 'hastens.meeting.ps.book',
    },

    book: function (data) {
        return helpers.callApi(this.SERVICE.BOOK, 'POST', null, data);
    },
    psTimeSlots: function (partnerSlug) {
        return helpers.callApi(this.SERVICE.PS_TIME_SLOTS, 'GET', partnerSlug);
    },
    psBook: function (data) {
        return helpers.callApi(this.SERVICE.PS_BOOK, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Meeting;
