import './ImageTextStory2.scss';

import React from 'react';
import clsx from 'clsx';

import { Image, useServer } from '../../../server/ServerProvider';
import { getFullImageUrl } from '../../../../shared/helpers';
import { RichText } from '../../../../shared/components/typography/RichText';

interface ImageTextStory2Content {
    text: {
        heading: string;
        body: string;
    };
    image: Image;
    imagePlacement: 'left' | 'right';
}

export const ImageTextStory2: React.FC<any> = () => {

    const { content, scaleWidthRecommendation } = useServer<ImageTextStory2Content>();
    const url = getFullImageUrl(content.image.sizes.desktop.src, scaleWidthRecommendation?.desktop, 'desktop');

    return (
        <div className={clsx([
            'has-image-text-story-2',
            `image-placement--${content.imagePlacement}`,
        ])}>
            <img
                src={url.toString()}
                alt={content.image.alt}
            />
            <div className="text">
                <h2>{content.text.heading}</h2>
                <RichText>{content.text.body}</RichText>
            </div>
        </div>
    );
};
