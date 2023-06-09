import './ImageTextStory.scss';

import React from 'react';

import { Image, useServer } from '../../../server/ServerProvider';
import { getFullImageUrl } from '../../../../shared/helpers';
import { Heading } from '../../../../shared/components/typography/Heading';
import { RichText } from '../../../../shared/components/typography/RichText';

interface ImageTextStoryContent {
    text: {
        heading: string;
        body: string;
    };
    image: Image;
}

export const ImageTextStory: React.FC<any> = () => {

    const { content, scaleWidthRecommendation } = useServer<ImageTextStoryContent>();
    const url = getFullImageUrl(content.image.sizes.desktop.src, scaleWidthRecommendation?.desktop, 'desktop');

    return (
        <div className="has-image-text-story">
            <img
                src={url.toString()}
                alt={content.image.alt}
            />
            <div className="text">
                <Heading level={3} size="xs">{content.text.heading}</Heading>
                <RichText className="body">{content.text.body}</RichText>
            </div>
        </div>
    );
};
