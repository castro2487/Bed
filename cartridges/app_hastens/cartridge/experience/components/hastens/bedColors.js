'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');

module.exports.render = RenderHelper.renderContentComponent('Colors', function(context) {

    var items = [];

    for (let index = 1; index <= 8; index++) {
        var image = context.content['image' + index];
        var video = context.content['video' + index];

        if (context.content['image' + index]) {
            items.push({
                thumbnail: ImageHelper.getThumbnail(image),
                image: {
                    sizes: ImageHelper.getSizes({
                        desktop: image,
                    }),
                },
                video: video,
            });
        }
    }

    return {
        items: items,
    };

});
