import './ThreeSplitTextStory.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../../shared/components/Background';
import { Image, ScaleWidth, Theme, useServer } from '../../../server/ServerProvider';
import { RichText } from '../../../../shared/components/typography/RichText';
import { ContentImage } from '../../../../shared/components/ContentImage';

interface ThreeSplitTextStoryContent {
    body: string;
    image1: Image;
    image2: Image;
    image3: Image;
    logo: Image;
    theme: Theme;
}

export function ThreeSplitTextStory(): ReactElement {

    const { content } = useServer<ThreeSplitTextStoryContent>();

    const backgroundScaleWidth = {
        mobile: ScaleWidth.W768,
        tablet: ScaleWidth.W1200,
        desktop: ScaleWidth.W500,
    };

    const logoScaleWidth = {
        mobile: ScaleWidth.W500,
        tablet: ScaleWidth.W500,
        desktop: ScaleWidth.W500,
    };

    return (
        <div className="has-three-split-text-story">
            <Background theme={content.theme} image={content.image1} scaleWidth={backgroundScaleWidth}>
                <div className="image-spacer"></div>
            </Background>
            <Background theme={content.theme} image={content.image2} scaleWidth={backgroundScaleWidth}>
                <div className="content-wrapper">
                    <ContentImage className="logo" sizes={content.logo.sizes} scaleWidth={logoScaleWidth} alt={content.logo.alt} />
                    <RichText>{content.body}</RichText>
                </div>
            </Background>
            <Background theme={content.theme} image={content.image3} scaleWidth={backgroundScaleWidth}>
                <div className="image-spacer"></div>
            </Background>
        </div>
    );

}
