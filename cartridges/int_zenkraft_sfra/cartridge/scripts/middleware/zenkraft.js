// TODO: Check for OCAPI authentication 
function customOcapiAuth(req, res, next) {
    var Encoding = require('dw/crypto/Encoding');
    var HTTPClient = require('dw/net/HTTPClient');
    var auth = req.httpHeaders.authorization;
    var credentialsString = Encoding.fromBase64(auth.replace('Basic ', '')).toString();
    var credentialsArray = credentialsString.split(':');
    var username = credentialsArray[0];
    var password = credentialsArray[1] + ':' + credentialsArray[2];
    var client = new HTTPClient();
    var clientID = request.httpParameterMap.client_id;
    var url = 'https://' + req.host + '/dw/oauth2/access_token?client_id='+ clientID +'&grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken';
    client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    client.open('POST', url, username, password);
    client.setTimeout(3000);
    client.send();
    if (client.statusCode !== 200 || !client.text.indexOf('access_token' != -1))
    {
        res.json({error: 'You are not Authorized'});
        return this.done(req, res);
    }
    else
    {
        next();
    }
}

module.exports = {
    customOcapiAuth: customOcapiAuth
};
