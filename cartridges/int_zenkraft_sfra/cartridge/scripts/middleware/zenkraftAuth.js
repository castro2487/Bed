// TODO: Check for OCAPI authentication 
function checkAuth(req, res, next) {
    var Site = require('dw/system/Site');
    var Encoding = require('dw/crypto/Encoding');
    var username = Site.getCurrent().getCustomPreferenceValue('ZenkraftRequestUser');
    var password  = Site.getCurrent().getCustomPreferenceValue('ZenkraftRequestPassword');
    var auth = request.httpHeaders.authorization;
    var credentials = Encoding.fromBase64(auth.replace('Basic ', ''));
    if (credentials != username + ':' + password) {
        res.json({error: 'You are not Authorized'});
        return this.done(req, res);
    }
    next();
}

module.exports = {
    checkAuth: checkAuth
};
