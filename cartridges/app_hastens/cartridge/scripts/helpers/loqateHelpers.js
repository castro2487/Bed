'use strict';
/* global request */
/**
* Builds and exposes the front-end javascript files for Loqate
*/
function Loqate() {
    var Site = require('dw/system/Site');
    var currentSite = Site.getCurrent();
    this.LOQATE_KEY = currentSite.getCustomPreferenceValue('loqateKey');
    this.LOQATE_ACCOUNT_CODE = currentSite.getCustomPreferenceValue('loqateAccountCode');
}

Loqate.prototype.getTag = function (limitedCountryCode) {
    var tag = '';
    // If LOQATE_ACCOUNT_CODE value is not equal to null and its value is greater than 0 return script tag else return an empty string
    if (this.LOQATE_ACCOUNT_CODE != null && this.LOQATE_ACCOUNT_CODE.length > 0) {
        tag += '<script>(function(n,t,i,r){var u,f;n[i]=n[i]||{},n[i].initial={accountCode:"';
        tag += this.LOQATE_ACCOUNT_CODE + '",host:"';
        tag += this.LOQATE_ACCOUNT_CODE + '.pcapredict.com"},n[i].on=n[i].on||function(){(n[i].onq=n[i].onq||[]).push(arguments)},u=t.createElement("script"),u.async=!0,u.src=r,f=t.getElementsByTagName("script")[0],f.parentNode.insertBefore(u,f)})(window,document,"pca","//';
        tag += this.LOQATE_ACCOUNT_CODE + '.pcapredict.com/js/sensor.js");';
        tag += 'window.loqateKey="' + this.LOQATE_KEY + '";';
        if (limitedCountryCode) {
            tag += 'window.limitedCountryCode="' + limitedCountryCode + '";';
        }
        tag += 'pca.on("ready", function () {var accountFields = [{ element: "shippingAddressOnedefault", field: "", mode: pca.fieldMode.DEFAULT },{ element: "shippingZipCodedefault", field: "", mode: pca.fieldMode.DEFAULT },{ element: "shippingAddressOnedefault", field: "Line1", mode: pca.fieldMode.POPULATE },{ element: "shippingAddressTwodefault", field: "Line2", mode: pca.fieldMode.POPULATE },{ element: "shippingAddressCitydefault", field: "City", mode: pca.fieldMode.POPULATE },{ element: "shippingZipCodedefault", field: "PostalCode", mode: pca.fieldMode.POPULATE },{ element: "shippingStatedefault", field: "ProvinceCode", mode: pca.fieldMode.POPULATE },{ element: "billingAddressOne", field: "", mode: pca.fieldMode.DEFAULT },{ element: "billingZipCode", field: "", mode: pca.fieldMode.DEFAULT },{ element: "billingAddressOne", field: "Line1", mode: pca.fieldMode.POPULATE },{ element: "billingAddressTwo", field: "Line2", mode: pca.fieldMode.POPULATE },{ element: "billingAddressCity", field: "City", mode: pca.fieldMode.POPULATE },{ element: "billingZipCode", field: "PostalCode", mode: pca.fieldMode.POPULATE },{ element: "billingState", field: "ProvinceCode", mode: pca.fieldMode.POPULATE },{ element: "billingCountry", field: "CountryIso2", mode: pca.fieldMode.POPULATE }];var options = {key: window.loqateKey,search: { countries: window.limitedCountryCode },suppressAutocomplete: false};pca.sourceString = "LoqateDemandwareCartridge";window.shippingControl = new pca.Address(accountFields, options);window.shippingControl.load();window.shippingControl.listen("populate", () => {$(accountFields).each((i, el) => {$(`#${el.element}`).trigger("blur");});});});';
        tag += 'pca.on("load", function (type, key, control) { if (type === "capture+") {' +
                'control.setCountryByIP(false);' +
                'control.setCountry("' + limitedCountryCode + '");' + '}});</script>';
    }
    return tag;
};

Loqate.prototype.getCustomCode = function () {
    var code = '';
    return code;
};

module.exports = new Loqate();
