'use strict';

var server = require('server');
var system = require('dw/system/System');
var cache = require('*/cartridge/scripts/middleware/cache');
var URLUtils = require('dw/web/URLUtils');

server.get('ComponentTypes', cache.applyDefaultCache, function (req, res, next) {
    if (system.getInstanceType() === system.PRODUCTION_SYSTEM) {
        res.redirect(URLUtils.url('Home-Show'));
        return next();
    }

    var componentTypes = require('~/cartridge/scripts/docs/componentTypes.js');
    var assets = require('*/cartridge/scripts/assets.js');
    assets.addJs('/js/hastens/docs.js');
    assets.addCss('/css/hastens/docs.css');

    componentTypes.forEach(function (group) {
        group.children.forEach(function (componentType) {
            var metaDefinition = require('*/cartridge/experience/components/hastens/'+componentType.id+'.json');
            componentType.name = metaDefinition.name;
            componentType.image = URLUtils.staticURL('/images/docs/'+componentType.id+'.jpg');
            if (componentType.children) {
                componentType.children.forEach(function (childComponentType) {
                    var metaDefinition = require('*/cartridge/experience/components/hastens/'+childComponentType.id+'.json');
                    childComponentType.name = metaDefinition.name.replace(/\(.*\)/g, '');
                    childComponentType.image = URLUtils.staticURL('/images/docs/'+childComponentType.id+'.jpg');
                });
            }
        });
    });

    res.render('docs/componentTypes', { componentTypes: componentTypes });
    next();
});

module.exports = server.exports();
