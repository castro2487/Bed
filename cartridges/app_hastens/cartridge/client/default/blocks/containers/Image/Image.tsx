import './Image.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Background } from '../../../shared/components/Background';
import { Image, Theme, useServer } from '../../server/ServerProvider';

type ImageRatio = '3-1' | '12-7' | '1-1';

export interface ImageContent {
    image: Image;
    theme?: Theme;
    footer?: string;
    desktopRatio?: ImageRatio;
    mobileRatio?: ImageRatio;
}

export function Image(): ReactElement {
    const { content, scaleWidthRecommendation } = useServer<ImageContent>();

    return (
        <Background image={content.image} theme={content.theme} scaleWidth={scaleWidthRecommendation}>
            <div className="has-image">
                <div className={clsx(
                    'image-ratio',
                    content.mobileRatio ? `ratio-${content.mobileRatio}` : null,
                    content.desktopRatio ? `desktop-ratio-${content.desktopRatio}` : null,
                )}>
                </div>
                {content.footer && (
                    <p className="bottom-text">{content.footer}</p>
                )}
            </div>
        </Background>
    );
}
