var dwsystem = require('dw/system');
var currentSite = dwsystem.Site.getCurrent();

function getCustomPreference(field) {
    var customPreference = null;

    if (currentSite && currentSite.getCustomPreferenceValue(field)) {
        customPreference = currentSite.getCustomPreferenceValue(field);
    }

    return customPreference;
}

function getCheckoutSFRA6Compatibility() {
    return getCustomPreference('DD_Accelerators_SFRA6_Compatibility');
}

module.exports = {
    getCheckoutSFRA6Compatibility: getCheckoutSFRA6Compatibility
};
