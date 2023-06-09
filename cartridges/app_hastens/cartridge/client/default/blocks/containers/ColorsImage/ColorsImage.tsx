import './ColorsImage.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../shared/components/Background';
import { Image, ScaleWidth, Theme, useServer } from '../../server/ServerProvider';
import { Paragraph } from '../../../shared/components/typography/Paragraph';

export interface ColorsImageContent {
    image: Image;
    theme: Theme;
    color: string;
}

export function ColorsImage(): ReactElement {
    const { content } = useServer<ColorsImageContent>();

    return (
        <div className="has-colors-image">
            <Background
                image={content.image}
                theme={content.theme}
                scaleWidth={{
                    desktop: ScaleWidth.W400,
                    tablet: ScaleWidth.W400,
                    mobile: ScaleWidth.W400,
                }}>
                <div className="image-ratio"></div>
            </Background>
            {content.color && (
                <Paragraph size="xs">{content.color}</Paragraph>
            )}
        </div>
    );
}
