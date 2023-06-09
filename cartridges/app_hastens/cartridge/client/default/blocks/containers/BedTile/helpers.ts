import { Image, Link } from '../../server/ServerProvider';
import { BookBedTestText } from '../../../shared/components/BookBedTest/BookBedTest';
import { ConfirmText } from '../../../shared/components/RequestCatalog/Confirmation';
import { RequestCatalogTexts } from '../../../shared/components/RequestCatalog/RequestCatalog';

export interface BedTileContent {
    bed: BedCode;
    link: Link;
    subheading: string;
    subheading2: string;
    description1: string;
    description2: string;
    bedWeight: string;
    bedHeight: string;
    bedLayers: string;
    description3: string;
    bedImage: Image;
    text: {
        close: string;
        showMore: string;
        cutThrough: string;
        enlargeImage: string;
        ShowMoreHelper: string;
        weightLabel: string;
        heightLabel: string;
        numLayersLabel: string;
    };
    storeLocator: {
        text: {
            cta: string;
        };
        link: string;
    };
    bedConfigurator: {
        text: {
            cta: string;
        };
    };
    requestCatalog: {
        text: ConfirmText & RequestCatalogTexts;
    };
    bookBedTest: {
        text: BookBedTestText & {
            cta: string;
        };
    };
}

export type ExpandedViewOrigin = 'right-top' | 'left-top';

interface AvailableSpace {
    left: number;
    right: number;
}

export interface BedDataTable {
    type: string;
    typeHelper: string;
    firmness: string;
    weight: string;
    height: string;
    heightHelper: string;
    fabricBolster: string;
    fabricStretch: string;
    piping: string;
    stitching: string;
    layers: string;
    layersHelper: string;
    filling: string;
    fillingHelper: string;
    springsNumber: string;
    springsNumberHelper: string;
    springsSystem1: string;
    springsSystem2: string;
    springsSystem3: string;
    springsCorner: string;
    springsEdge: string;
    padding: string;
    frame: string;
    underLining: string;
    cornerFitting: string;
    engravedPlaque: string;
    embroideredName: string;
    oekoCertificate: string;
    latexfree: string;
}

export type BedCode = '2000t' | 'adjustable' | 'appaloosa' | 'eala' | 'excel' | 'grandVividus' | 'herlewing' | 'maranga' | 'marquis' | 'marwari' | 'superia' | 'vividus';
export interface BedContent {
    [key: string]: {
        name: string;
        cutThroughImg?: Image;
    };
}

export const beds: BedContent = {
    '2000t': {
        name: '2000T',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-2000t.png'),
    },
    'adjustable': {
        name: 'Adjustable',
    },
    'appaloosa': {
        name: 'Appaloosa',
    },
    'eala': {
        name: 'Eala',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-eala.png'),
    },
    'excel': {
        name: 'Excel',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-excel.png'),
    },
    'grandVividus': {
        name: 'Grand Vividus',
    },
    'herlewing': {
        name: 'Herlewing',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-herlewing.png'),
    },
    'maranga': {
        name: 'Maranga',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-maranga.png'),
    },
    'marquis': {
        name: 'Marquis',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-marquis.png'),
    },
    'marwari': {
        name: 'Marwari',
    },
    'superia': {
        name: 'Superia',
        cutThroughImg: getCutThroughImage('https://static.hastens.com/blocks/beds/cut-through-2020/cut-through-superia.png'),
    },
    'vividus': {
        name: 'Vividus',
    },
};

function getCutThroughImage(url: string): Image {
    return {
        sizes: {
            mobile: { src: url.replace('static.hastens.com/', 'static.hastens.com/768/') },
            tablet: { src: url.replace('static.hastens.com/', 'static.hastens.com/600/') },
            desktop: { src: url.replace('static.hastens.com/', 'static.hastens.com/400/') },
        },
    };
}

export function calculateOrigin(elementRect: DOMRect, boundingElementRect: DOMRect, blockSpacing: number): ExpandedViewOrigin {
    const availableSpace = calculateAvailableSpace(elementRect, boundingElementRect);
    const expandedViewWidth = elementRect.width * 2 + blockSpacing;

    if (availableSpace.right >= expandedViewWidth) {
        return 'left-top';
    } else if (availableSpace.left >= expandedViewWidth) {
        return 'right-top';
    }
}

function calculateAvailableSpace(elementRect: DOMRect, boundingElementRect: DOMRect): AvailableSpace {
    return {
        left: calculateAvailableLeftSpace(elementRect, boundingElementRect),
        right: calculateAvailableRightSpace(elementRect, boundingElementRect),
    };
}

function calculateAvailableLeftSpace(elementRect: DOMRect, boundingElementRect: DOMRect): number {
    const elementRight = elementRect.left + window.pageXOffset + elementRect.width;
    const boundingElementLeft = boundingElementRect.left + window.pageXOffset;
    return elementRight - boundingElementLeft;
}

function calculateAvailableRightSpace(elementRect: DOMRect, boundingElementRect: DOMRect): number {
    const elementLeft = elementRect.left + window.pageXOffset;
    const boundingElementRight = boundingElementRect.left + window.pageXOffset + boundingElementRect.width;
    return boundingElementRight - elementLeft;
}
