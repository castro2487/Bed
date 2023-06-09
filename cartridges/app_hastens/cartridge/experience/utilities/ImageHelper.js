var ImageHelper = {};
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');
var productImagesHelper = require('*/cartridge/scripts/helpers/productImagesHelpers');

/**
 * @param {Image} image
 * @param {string} device
 * @return {Object}
 */
ImageHelper.getSize = function (image, device) {
    if (image) {
        const url = ImageTransformation.url(image.file, { device: device });
        return {
            src: url.toString(),
            focalPoint: {
                x: image.focalPoint.x * 100,
                y: image.focalPoint.y * 100,
            },
            height: image.metaData.height,
            width: image.metaData.width,
        };
    }

    return null;
}

/**
 * @param {Object} images
 * @param {string} size
 * @return {Image}
 */
ImageHelper.getClosestParent = function (images, size) {
    if (size === 'mobile') {
        if (images.mobile) {
            return images.mobile;
        }
        if (images.tablet) {
            return images.tablet;
        }
        if (images.desktop) {
            return images.desktop;
        }
    }
    if (size === 'tablet') {
        if (images.tablet) {
            return images.tablet;
        }
        if (images.desktop) {
            return images.desktop;
        }
    }
    if (size === 'desktop') {
        if (images.desktop) {
            return images.desktop;
        }
    }

    return null;
}

/**
 * @param {Object} images
 * @param {boolean} disableInheritance
 * @return {Object}
 */
ImageHelper.getSizes = function (images, disableInheritance) {
    if (disableInheritance) {
        return {
            mobile: ImageHelper.getSize(images.mobile, 'mobile'),
            tablet: ImageHelper.getSize(images.tablet, 'tablet'),
            desktop: ImageHelper.getSize(images.desktop, 'desktop'),
        };
    }
    return {
        mobile: ImageHelper.getSize(ImageHelper.getClosestParent(images, 'mobile'), 'mobile'),
        tablet: ImageHelper.getSize(ImageHelper.getClosestParent(images, 'tablet'), 'tablet'),
        desktop: ImageHelper.getSize(ImageHelper.getClosestParent(images, 'desktop'), 'desktop'),
    };
}

/**
 * @param {Image} image
 * @return {Object}
 */
ImageHelper.getThumbnail = function (image) {
    if (image) {
        return {
            src: productImagesHelper.getDISImageURL(image.file, 'small'),
        };
    }

    return null;
}

/**
 * @param {Image} image
 * @return {string}
 */
ImageHelper.getImageUrl = function (image) {
    if (image) {
        const url = ImageTransformation.url(image.file, {});
        return url.toString();
    }

    return '';
}

module.exports = ImageHelper;
