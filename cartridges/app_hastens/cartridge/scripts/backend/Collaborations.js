'use strict';

const helpers = require('./BackendHelpers');

let Collaborations = {
    // Service constants
    SERVICE: {
        POST: 'hastens.collaborations.post',
        RESTORE_CAMPAIGN: 'hastens.collaborations.restore-campaign'
    },

    post: function (data) {
        return helpers.callApi(this.SERVICE.POST, 'POST', null, data);
    },

    restoreCampaign: function (data) {
        return helpers.callApi(this.SERVICE.RESTORE_CAMPAIGN, 'POST', null, data);
    },
}

// Exports ===================================================================

module.exports = Collaborations;
