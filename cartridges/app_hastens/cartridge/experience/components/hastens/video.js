'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('VideoBlock', function(context) {
    return {
        text: {
            heading: context.content.heading,
            body: context.content.body,
        },
        textPosition: context.content.textPosition ? context.content.textPosition.value : 'left',
        image: {
            sizes: ImageHelper.getSizes({
                mobile: context.content.mobileImage,
                tablet: context.content.tabletImage,
                desktop: context.content.image,
            }),
            alt: context.content.imageAlt,
        },
        ratio: context.content.ratio ? context.content.ratio.value : '16-9',
        video: context.content.video,
        theme: context.content.theme ? context.content.theme.value : null,
        dialogTheme: context.content.dialogTheme ? context.content.dialogTheme.value : 'dark',
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
        blockId: context.content.componentId,
    };
});
