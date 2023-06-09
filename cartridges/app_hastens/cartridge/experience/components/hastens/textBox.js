'use strict';

var URLUtils = require('dw/web/URLUtils');
var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('TextBox', function (context) {
    var body = setUrl(context.content.body ? context.content.body.value : null);
    return {
        text: {
            body: body,
        },
        theme: context.content.theme ? context.content.theme.value : null,
    };
});

function setUrl(string) {
    try {
        var rounds = 0;
        if (string) {
            while (string.indexOf("$url(") !== -1 && rounds < 100) {
                rounds++;
                string = string.replace(getDynamicUrlFromString(string, 'outer'), URLUtils.url(getDynamicUrlFromString(string, 'inner')).toString());
            }
        }
    } finally {
        return string;
    }
}


function getDynamicUrlFromString(text, position) {
    var startIndex = text.lastIndexOf("$url(");
    var endIndex = text.lastIndexOf(")$");
    if (startIndex && endIndex) {
        var delimiter = {
            inner: [6, -1],
            outer: [0, 2]
        }
        var value = text.substring(
            startIndex + delimiter[position][0],
            endIndex + delimiter[position][1]
        );

        return value;
    }

    return '';
}
