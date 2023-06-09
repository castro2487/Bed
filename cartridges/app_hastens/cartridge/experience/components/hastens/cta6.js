'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var UrlHelper = require('~/cartridge/experience/utilities/UrlHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BookBedTestCTA', function(context) {
    return {
        link: {
            text: context.content.linkText,
            url: UrlHelper.getFullUrl(context.content.linkUrl, context.content.anchor),
        },
        text: {
            heading: context.content.heading,
            intro: context.content.intro,
            stepsHeading: context.content.stepsHeading,
            steps: [
                {
                    heading1: context.content.stepHeading1Part1,
                    heading2: context.content.stepHeading1Part2,
                    image: { sizes: ImageHelper.getSizes({ desktop: context.content.stepImage1 }) },
                    body: context.content.stepBody1,
                },
                {
                    heading1: context.content.stepHeading2Part1,
                    heading2: context.content.stepHeading2Part2,
                    image: { sizes: ImageHelper.getSizes({ desktop: context.content.stepImage2 }) },
                    body: context.content.stepBody2,
                },
                {
                    heading1: context.content.stepHeading3Part1,
                    heading2: context.content.stepHeading3Part2,
                    image: { sizes: ImageHelper.getSizes({ desktop: context.content.stepImage3 }) },
                    body: context.content.stepBody3,
                },
                {
                    heading1: context.content.stepHeading4Part1,
                    heading2: context.content.stepHeading4Part2,
                    image: { sizes: ImageHelper.getSizes({ desktop: context.content.stepImage4 }) },
                    body: context.content.stepBody4,
                },
            ],
        },
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
        blockId: context.content.componentId,
    };
});
