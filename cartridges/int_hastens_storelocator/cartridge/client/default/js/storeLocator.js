'use strict';

var processInclude = require('./util');
var dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var customParseFormat = require('dayjs/plugin/customParseFormat');

require('dayjs/locale/en-gb.js');
require('dayjs/locale/cs.js');
require('dayjs/locale/da.js');
require('dayjs/locale/de.js');
require('dayjs/locale/es.js');
require('dayjs/locale/fi.js');
require('dayjs/locale/fr.js');
require('dayjs/locale/is.js');
require('dayjs/locale/it.js');
require('dayjs/locale/ko.js');
require('dayjs/locale/lt.js');
require('dayjs/locale/lv.js');
require('dayjs/locale/nb.js');
require('dayjs/locale/nl.js');
require('dayjs/locale/pl.js');
require('dayjs/locale/pt.js');
require('dayjs/locale/ru.js');
require('dayjs/locale/sk.js');
require('dayjs/locale/sv.js');
require('dayjs/locale/tr.js');
require('dayjs/locale/zh.js');

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

$(document).ready(function () {
    var jumbotron = $('.jumbotron');
    var locale = jumbotron.data('language') + '_' + jumbotron.data('locale');
    dayjs.locale(getDayjsLocale(locale));

    processInclude(require('./storeLocator/storeLocator'));
});

function getDayjsLocale(locale) {
    switch (locale) {
        case 'en_en':
        case 'en_LU':
        case 'en_NL':
            return 'en-gb';
        case 'cs_CZ':
            return 'cs';
        case 'da_DK':
            return 'da';
        case 'de_DE':
        case 'de_AT':
        case 'de_BE':
        case 'de_CH':
        case 'de_LU':
            return 'de';
        case 'es_ES':
            return 'es';
        case 'fi_FI':
            return 'fi';
        case 'fr_FR':
        case 'fr_BE':
        case 'fr_CH':
        case 'fr_LU':
            return 'fr';
        case 'is_IS':
            return 'is';
        case 'it_IT':
        case 'it_CH':
            return 'it';
        case 'ko_KR':
            return 'ko';
        case 'lt_LT':
            return 'lt';
        case 'lv_LV':
            return 'lv';
        case 'nl_NL':
        case 'nl_BE':
            return 'nl';
        case 'no_NO':
            return 'nb';
        case 'pl_PL':
            return 'pl';
        case 'pt_PT':
            return 'pt';
        case 'ru_RU':
        case 'ru_LT':
        case 'ru_LV':
            return 'ru';
        case 'sk_SK':
            return 'sk';
        case 'sv_FI':
        case 'sv_SE':
            return 'sv';
        case 'tr_TR':
            return 'tr';
        case 'zh_CN':
            return 'zh';
        default:
            return 'en-gb';
    }
}
