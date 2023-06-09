'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

module.exports.render = RenderHelper.renderStandardComponentWithContext('GVBedTile', function(context) {
    var componentId = context.content.componentId || '';
    return {
        link: {
            text: Resource.msg('bedtile.grandvividus.readmore', 'hastens', null),
            url: URLUtils.url('GrandVividus-Show').toString(),
        },
        blockId: componentId.replace(/\s/g, "-"),
        image: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.mobileImage,
                desktop: context.content.image,
            }),
        },
    };
});
