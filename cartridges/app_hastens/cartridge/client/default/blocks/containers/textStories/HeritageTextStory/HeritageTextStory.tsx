import './HeritageTextStory.scss';

import React from 'react';

import { Image, Theme, useServer } from '../../../server/ServerProvider';
import { getFullImageUrl } from '../../../../shared/helpers';
import { RichText } from '../../../../shared/components/typography/RichText';
import { Background } from '../../../../shared/components/Background';

interface HeritageTextStoryContent {
    heading: string;
    body: string;
    body2: string;
    image: Image;
    imageCaption: string;
    imagePosition: 'left' | 'right';
    theme: Theme;
}

export const HeritageTextStory: React.FC<any> = () => {

    const { content } = useServer<HeritageTextStoryContent>();
    const url = getFullImageUrl(content.image.sizes.desktop.src, 500, 'desktop');

    const imageElement = (
        <figure>
            <img src={url.toString()} alt="" />
            <figcaption>{content.imageCaption}</figcaption>
        </figure>
    );

    return (
        <Background theme={content.theme}>
            <div className="has-heritage-text-story">
                <div className="content-wrapper">
                    <div className="column-1">
                        <h2 className="heading">{content.heading}</h2>
                        {content.imagePosition === 'left' && imageElement}
                        <RichText className="body">{content.body}</RichText>
                    </div>
                    <div className="column-2">
                        {content.imagePosition === 'right' && imageElement}
                        <RichText className="body">{content.body2}</RichText>
                    </div>
                </div>
            </div>
        </Background>
    );
};
