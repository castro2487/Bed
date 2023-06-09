'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('InvestText', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body,
            storeSize: context.content.storeSize,
            investment: context.content.investment,
            roi: context.content.roi,
            storeSizeHeader: Resource.msg('nbd.invest.info.header1', 'hastens', null),
                investmentHeader: Resource.msg('nbd.invest.info.header2', 'hastens', null),
                roiHeader: Resource.msg('nbd.invest.info.header3', 'hastens', null),
        }
    };
});
