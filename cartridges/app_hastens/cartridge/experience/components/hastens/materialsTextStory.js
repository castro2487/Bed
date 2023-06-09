'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('MaterialsTextStory', function (context) {
    return {
        text: {
            headingMain: context.content.headingMain,
            bodyMain: context.content.bodyMain,
            body: context.content.body ? context.content.body.value : '',
        },
        theme: context.content.theme ? context.content.theme.value : null,
        columns: context.content.columns ? parseInt(context.content.columns.value) : null,
        image: {
            sizes: ImageHelper.getSizes(
                {
                    mobile: context.content.mobileImage,
                    tablet: context.content.tabletImage,
                    desktop: context.content.image,
                },
                context.content.disableImageInheritance
            ),
            alt: context.content.imageAlt,
        },
        background: context.content.background,
    };
});
