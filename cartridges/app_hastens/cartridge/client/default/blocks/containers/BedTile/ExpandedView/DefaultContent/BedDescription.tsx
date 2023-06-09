import './BedDescription.scss';

import React from 'react';

import { useServer } from '../../../../server/ServerProvider';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { BedTileContent } from '../../helpers';

export function BedDescription() {
    const { content: {
        description1,
        description2,
        bedWeight,
        bedHeight,
        bedLayers,
        description3,
        text,
    } } = useServer<BedTileContent>();

    if (![description1, description2, bedWeight, bedHeight, bedLayers, description3].some((prop) => !!prop)) {
        return null;
    }

    return (
        <div className="has-bed-tile__bed-description">
            <div className="slot-1">
                <Paragraph size="sm"><b>{description1}</b></Paragraph>
            </div>
            <div className="slot-2">
                <Paragraph size="xs">{description2}</Paragraph>
            </div>
            <div className="slot-3">
                <Paragraph size="xs">
                    <b>{text.weightLabel}: </b>{bedWeight || '-'}<br />
                    <b>{text.heightLabel}: </b>{bedHeight || '-'}<br />
                    {bedLayers && <><b>{text.numLayersLabel}: </b>{bedLayers}</>}
                </Paragraph>
            </div>
            <div className="slot-4">
                <Paragraph size="xs">{description3}</Paragraph>
            </div>
        </div>
    );
}
