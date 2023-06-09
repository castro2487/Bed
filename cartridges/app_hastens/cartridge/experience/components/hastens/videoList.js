'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderStandardComponentWithContext('VideoList', function (context) {

    var videos = [];

    for (let index = 1; index <= 10; index++) {
        var url = context.content['videoUrl' + index];
        var name = context.content['videoName' + index];
        var image = context.content['videoImage' + index];

        if (url) {
            videos.push({
                name: name,
                url: url,
                image: { sizes: ImageHelper.getSizes({ desktop: image }) },
            });
        }
    }

    return {
        heading: context.content.heading,
        intro: context.content.intro,
        videos: videos,
        theme: context.content.theme ? context.content.theme.value : 'primary-1',
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
    };

});
