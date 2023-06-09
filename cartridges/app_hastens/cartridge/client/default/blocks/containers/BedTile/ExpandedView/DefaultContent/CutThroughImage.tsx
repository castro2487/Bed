import './CutThroughImage.scss';

import React, { FC } from 'react';

import { Image, useServer } from '../../../../server/ServerProvider';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { BedTileContent } from '../../helpers';
import { StringHelper } from '../../../../../shared/components/StringHelper';
import { Background } from '../../../../../shared/components/Background';

interface CutThroughImageContent {
    bed: string;
    image: Image;
}

export const CutThroughImage: FC<CutThroughImageContent> = ({ image, bed }) => {
    const { content: { text } } = useServer<BedTileContent>();

    if (!image) {
        return null;
    }

    return (
        <div className="has-bed-tile__cut-through-image">
            <Paragraph size="sm" className="mb-2">
                <StringHelper
                    parameters={[bed]}>
                    {text.cutThrough}
                </StringHelper>
            </Paragraph>
            <Background
                className="cut-through-image"
                image={image}
                size="contain"
            />
        </div>
    );
};


