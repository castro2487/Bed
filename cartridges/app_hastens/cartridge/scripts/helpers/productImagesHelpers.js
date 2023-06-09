'use strict';

var DISConfiguration = require('*/cartridge/config/imageConfigDIS');
var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');

//If a URL replacement is used it would return the final URL, otherwise the given URL object 
function getFinalUrlAsString(imageURL) {
    // In case the site preference is set, update the instance used as image source
    var current = imageURL.toString();
    var replacement = Site.current.getCustomPreferenceValue('disImageSourceEnvironment');
    if (replacement && replacement.value) {
        return current.replace(/(^.*_)[a-zA-Z0-9]{3}(\/on\/demandware.*$)/, '$1' + replacement.value + '$2');
    }
    return current;
}

//Get the missing image URL
function getMissingImageURL(type) {
    var missingImage;

    if(DISConfiguration.missingImages && DISConfiguration.missingImages[type]) {
        missingImage = DISConfiguration.missingImages[type];
    }

    if(missingImage) {
        var imageURL = URLUtils.imageURL(URLUtils.CONTEXT_CATALOG, 'Hastens_master', 'images/' + missingImage, DISConfiguration[type]);
        return getFinalUrlAsString(imageURL);
    } else {
        return '';
    }
}

/**
 * Returns the DIS image URL or the missing image URL if it doesn't exist
 * @param {Mediafile} image - Image Object
 * @param {string} type - Type of view (resolution) that should be generated
 * @returns {string} - Absolute Image URL
 */
function getDISImageURL(image, type) {
    if(image) {
        var transformationObj = DISConfiguration.hasOwnProperty(type) ? DISConfiguration[type] : {};
        var absURL = image.getAbsImageURL(transformationObj);
        return getFinalUrlAsString(absURL);
    } else {
        return getMissingImageURL(type);
    }
}

exports.getDISImageURL = getDISImageURL;
exports.getMissingImageURL = getMissingImageURL;


