'use strict';

var URLUtils = require('dw/web/URLUtils');

module.exports.init = function (editor) {
    editor.configuration.put('type', 'RichTextEditor');
    editor.configuration.put('tinymceContentCssUrl', URLUtils.absStatic('/css/hastens/tinymceContent.css').toString());
}
