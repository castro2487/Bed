'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderContentComponent('InformationTable', function(context) {

    return {
        content: {
            type: context.content.infoTableType,
            firmness:  context.content.infoTableFirmness,
            weight: context.content.infoTableWeight,
            height: context.content.infoTableHeight,
            fabricBolster: context.content.infoTableFabricBolster,
            fabricStretch: context.content.infoTableFabricStretch,
            piping: context.content.infoTablePiping,
            stitching: context.content.infoTableStitching,
            layers: context.content.infoTableLayers,
            filling: context.content.infoTableFilling,
            springsNumber: context.content.infoTableSpringsNumber,
            springsSystem1: context.content.infoTableSpringsSystem,
            springsCorner: context.content.infoTableSpringsCorner,
            springsEdge: context.content.infoTableSpringsEdge,
            padding: context.content.infoTablePadding,
            springsSystem2: context.content.infoTableSpringsSystem2,
            springsCorner2: context.content.infoTableSpringsEdge2,
            padding2: context.content.infoTablePadding2,
            springsSystem3: context.content.infoTableSpringsSystem3,
            frame: context.content.infoTableFrame,
            underlining: context.content.infoTableUnderlining,
            cornerFitting: context.content.infoTableCornerFitting,
            engravedPlaque: context.content.infoTableEngravedPlaque,
            embroideredName: context.content.infoTableEmbroideredName,
            oekoCertificate: context.content.infoTableOekoCertificate,
            latexFree: context.content.infoTableLatexFree,
        },
        text: {
            type: Resource.msg('bedtile.bedtabledata.type', 'hastens', null),
            typeHelper: Resource.msg('bedtile.bedtabledata.type.helper', 'hastens', null),
            firmness: Resource.msg('bedtile.bedtabledata.firmness', 'hastens', null),
            weight: Resource.msg('bedtile.bedtabledata.weight', 'hastens', null),
            height: Resource.msg('bedtile.bedtabledata.height', 'hastens', null),
            heightHelper: Resource.msg('bedtile.bedtabledata.height.helper', 'hastens', null),
            fabricBolster: Resource.msg('bedtile.bedtabledata.fabricbolster', 'hastens', null),
            fabricStretch: Resource.msg('bedtile.bedtabledata.fabricstretch', 'hastens', null),
            piping: Resource.msg('bedtile.bedtabledata.piping', 'hastens', null),
            stitching: Resource.msg('bedtile.bedtabledata.stitching.side', 'hastens', null),
            layers: Resource.msg('bedtile.bedtabledata.layers', 'hastens', null),
            layersHelper: Resource.msg('bedtile.bedtabledata.layers.helper', 'hastens', null),
            filling: Resource.msg('bedtile.bedtabledata.filling', 'hastens', null),
            fillingHelper: Resource.msg('bedtile.bedtabledata.filling.helper', 'hastens', null),
            springsNumber: Resource.msg('bedtile.bedtabledata.springs.number', 'hastens', null),
            springsNumberHelper: Resource.msg('bedtile.bedtabledata.springs.number.helper', 'hastens', null),
            springsSystem1: Resource.msg('bedtile.bedtabledata.springs.system1', 'hastens', null),
            springsCorner: Resource.msg('bedtile.bedtabledata.springs.corner', 'hastens', null),
            springsEdge: Resource.msg('bedtile.bedtabledata.springs.edge', 'hastens', null),
            padding: Resource.msg('bedtile.bedtabledata.padding', 'hastens', null),
            springsSystem2: Resource.msg('bedtile.bedtabledata.springs.system2', 'hastens', null),
            springsCorner2: Resource.msg('bedtile.bedtabledata.springs.corner', 'hastens', null),
            padding2: Resource.msg('bedtile.bedtabledata.padding', 'hastens', null),
            springsSystem3: Resource.msg('bedtile.bedtabledata.springs.system3', 'hastens', null),
            frame: Resource.msg('bedtile.bedtabledata.frame', 'hastens', null),
            underlining: Resource.msg('bedtile.bedtabledata.underlining', 'hastens', null),
            cornerFitting: Resource.msg('bedtile.bedtabledata.cornerfitting', 'hastens', null),
            engravedPlaque: Resource.msg('bedtile.bedtabledata.engravedplaque', 'hastens', null),
            embroideredName: Resource.msg('bedtile.bedtabledata.embroideredname', 'hastens', null),
            oekoCertificate: Resource.msg('bedtile.bedtabledata.oekocertificate', 'hastens', null),
            latexFree: Resource.msg('bedtile.bedtabledata.latexfree', 'hastens', null),
        }
    };

});
