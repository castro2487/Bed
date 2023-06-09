module.exports = {
    getFullUrl: function (url, anchor) {
        var fullUrl = url || '';
        if ((fullUrl.indexOf('#') === -1) && anchor) {
            fullUrl += ('#' + anchor);
        }
        return fullUrl;
    }
};
