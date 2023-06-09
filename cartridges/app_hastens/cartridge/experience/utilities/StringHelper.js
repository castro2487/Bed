module.exports = {
    makeAlphanumeric: function (string) {
        if (!string) {
            return '';
        }
        return string.replace(/[^a-z0-9]/gi, '');
    },
    makeClassName: function (classNames) {
        return classNames.filter(function (item) { return !!item }).join(' ');
    }
};
