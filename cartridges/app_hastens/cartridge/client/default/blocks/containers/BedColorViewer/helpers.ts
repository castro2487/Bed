/* eslint-disable no-multi-spaces, key-spacing */

export type BedCode = 'vividus' | '2000t' | 'herlewing' | 'eala' | 'maranga' | 'superia' | 'excel' | 'marquis';

const colorThumbnails = {
    'bluecheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_bluecheck.jpg',
    'beigecheck'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_beigecheck.jpg',
    'blackcheck'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_blackcheck.jpg',
    'goldcheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_goldcheck.jpg',
    'graphitecheck'   : 'https://static.hastens.com/blocks/accessories/colorpalette/color_graphitecheck.jpg',
    'silvergreycheck' : 'https://static.hastens.com/blocks/accessories/colorpalette/color_silvergreycheck.jpg',
    'whitecheck'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_whitecheck.jpg',
    'solidroyalnavy'  : 'https://static.hastens.com/blocks/accessories/colorpalette/color_royalnavycheck2.jpg',
    'solidblack'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidblack.jpg',
    'solidbrown'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidbrown.jpg',
    'sand'            : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidsand.jpg',
    's12'             : 'https://static.hastens.com/blocks/accessories/colorpalette/color_s12.jpg',
    'greysolid'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidgrey.jpg',
    'pearlbeige'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_pearlbeigecheck.jpg',
};

const colorNames = {
    'bluecheck'       : 'Blue Check',
    'beigecheck'      : 'Silver Beige Check',
    'blackcheck'      : 'Black Check',
    'goldcheck'       : 'Gold Check',
    'graphitecheck'   : 'Graphite Check',
    'silvergreycheck' : 'Silver Grey Check',
    'whitecheck'      : 'Solid White Check',
    'solidroyalnavy'  : 'Solid Royal Navy Check',
    'solidblack'      : 'Solid Black Check',
    'solidbrown'      : 'Solid Brown Check',
    'sand'            : 'Solid Sand Check',
    's12'             : 'S12',
    'greysolid'       : 'Solid Grey Check',
    'pearlbeige'      : 'Solid Pearl Check',
};

// Missing thumbnails for
// 2000t: appaloosa marwari
// excel: oceanblue
// maranga: tributecheck
const colors = {
    'eala'     : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'excel'    : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'maranga'  : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'marquis'  : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'herlewing': ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'superia'  : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck',               'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
    'vividus'  : ['bluecheck', 'beigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'silvergreycheck', 'whitecheck', 'solidroyalnavy', 'solidblack', 'solidbrown', 'sand', 's12', 'greysolid', 'pearlbeige'],
};

const oldBedCodes = {
    '2000t'    : '2000t',
    'eala'     : 'auroria',
    'excel'    : 'excel',
    'maranga'  : 'luxuria',
    'marquis'  : 'marquis',
    'herlewing': 'proferia',
    'superia'  : 'superia',
    'vividus'  : 'vividus',
};

export function getColors(bedCode: BedCode) {
    if (bedCode === '2000t') {
        return get2000tColors();
    }

    return colors[bedCode].map((colorCode) => ({
        code: colorCode,
        name: colorNames[colorCode],
        thumbnail: colorThumbnails[colorCode],
        image: `https://static.hastens.com/blocks/bed-viewer/colors/${oldBedCodes[bedCode]}_${colorCode}.jpg`,
    }));
}

const colorThumbnails2000t = {
    'bluecheck'             : 'https://static.hastens.com/blocks/accessories/colorpalette/color_bluecheck.jpg',
    'silverbeigecheck'      : 'https://static.hastens.com/blocks/accessories/colorpalette/color_beigecheck.jpg',
    'blackcheck'            : 'https://static.hastens.com/blocks/accessories/colorpalette/color_blackcheck.jpg',
    'goldcheck'             : 'https://static.hastens.com/blocks/accessories/colorpalette/color_goldcheck.jpg',
    'graphitecheck'         : 'https://static.hastens.com/blocks/accessories/colorpalette/color_graphitecheck.jpg',
    'lightolivecheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_lightolivecheck.jpg',
    'redearthcheck'         : 'https://static.hastens.com/blocks/accessories/colorpalette/color_redearthcheck.jpg',
    'silvergreycheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_silvergreycheck.jpg',
    'taupecheck'            : 'https://static.hastens.com/blocks/accessories/colorpalette/Taupe_Check.jpeg',
    'solidroyalnavycheck'   : 'https://static.hastens.com/blocks/accessories/colorpalette/color_royalnavycheck2.jpg',
    'solidblackcheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidblack.jpg',
    'solidbrowncheck'       : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidbrown.jpg',
    'solidsandcheck'        : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidsand.jpg',
    's12'                   : 'https://static.hastens.com/blocks/accessories/colorpalette/color_s12.jpg',
    'solidgreycheck'        : 'https://static.hastens.com/blocks/accessories/colorpalette/color_solidgrey.jpg',
    'solidpearlbeigecheck'  : 'https://static.hastens.com/blocks/accessories/colorpalette/color_pearlbeigecheck.jpg',
};

const colorNames2000t = {
    'bluecheck'             : 'Blue Check',
    'silverbeigecheck'      : 'Silver Beige Check',
    'blackcheck'            : 'Black Check',
    'goldcheck'             : 'Gold Check',
    'graphitecheck'         : 'Graphite Check',
    'lightolivecheck'       : 'Light Olive Check',
    'redearthcheck'         : 'Red Earth Check',
    'silvergreycheck'       : 'Silver Grey Check',
    'taupecheck'            : 'Taupe Check',
    'solidroyalnavycheck'   : 'Solid Royal Navy Check',
    'solidblackcheck'       : 'Solid Black Check',
    'solidbrowncheck'       : 'Solid Brown Check',
    'solidsandcheck'        : 'Solid Sand Check',
    's12'                   : 'S12',
    'solidgreycheck'        : 'Solid Grey Check',
    'solidpearlbeigecheck'  : 'Solid Pearl Check',
};

const colors2000t = ['bluecheck', 'silverbeigecheck', 'blackcheck', 'goldcheck', 'graphitecheck', 'lightolivecheck', 'redearthcheck', 'silvergreycheck', 'taupecheck', 'solidroyalnavycheck', 'solidblackcheck', 'solidbrowncheck', 'solidsandcheck', 's12', 'solidgreycheck', 'solidpearlbeigecheck'];

function get2000tColors() {
    return colors2000t.map((colorCode) => ({
        code: colorCode,
        name: colorNames2000t[colorCode],
        thumbnail: colorThumbnails2000t[colorCode],
        image: `https://static.hastens.com/blocks/bed-viewer-2020/2000T/${colorCode}.jpg`,
    }));
}
