var RenderHelper = {};
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js');

var shouldDisableBedConfigurator = (function () {
    switch(request.locale) {
        case 'zh_CN':
        case 'ko_KR':
            return true;
        default:
            return false;
    }
})();

/**
 * @param {string} type
 * @param {Object} content
 * @param {Object} component
 * @return {string}
 */
RenderHelper.renderStandardComponent = function(type, content, component) {
    const model = new HashMap();

    model.block = JSON.stringify({
        type: type,
        blockId: component ? component.id : null,
        backendUrl: URLUtils.url('Backend-').toString(),
        staticUrl: URLUtils.staticURL('/').toString(),
        content: content,
        locale: request.locale,
        pageId: request.httpParameterMap.cid.stringValue,
    });

    return new Template('experience/components/standardComponent').render(model).text;
};

/**
 * @param {string} type
 * @param {function} callback
 * @return {function}
 */
RenderHelper.renderStandardComponentWithContext = function(type, callback) {
    return function(context) {
        if (type === 'BedConfigurator' && shouldDisableBedConfigurator) {
            return '';
        }

        const model = new HashMap();
        const regions = PageRenderHelper.getRegionModelRegistry(context.component);

        model.regions = Object.keys(regions)
            .filter(function(regionName) {
                return regionName !== 'container';
            })
            .map(function(regionName) {
                return regions[regionName];
            });

        let containerClass = [];
        if (Array.isArray(callback(context).containerClass)) {
            containerClass = callback(context).containerClass;
        } else if (callback(context).containerClass) {
            containerClass = [callback(context).containerClass];
        }

        model.block = JSON.stringify({
            type: type,
            backendUrl: URLUtils.url('Backend-').toString(),
            staticUrl: URLUtils.staticURL('/').toString(),
            content: callback(context),
            // TODO: containerClass should not be inside content
            containerClass: containerClass,
            blockId: callback(context).blockId || context.getComponent().getID(),
            trackingId: callback(context).trackingId || context.getComponent().getID(),
            locale: request.locale,
            shouldDisableBedConfigurator: shouldDisableBedConfigurator,
            pageId: request.httpParameterMap.cid.stringValue,
        });

        model.editMode = PageRenderHelper.isInEditMode();
        model.blockId = callback(context).blockId || context.getComponent().getID();
        return new Template('experience/components/standardComponent').render(model).text;
    };

};

/**
 * @param {string} type
 * @param {function} callback
 * @return {function}
 */
RenderHelper.renderContentComponent = function(type, callback) {
    return function(context) {
        const model = new HashMap();

        model.block = JSON.stringify({
            type: type,
            content: callback(context),
        });

        return new Template('experience/components/contentComponent').render(model).text;
    };

};

module.exports = RenderHelper;
