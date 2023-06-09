import React, { ReactElement } from 'react';

import { DialogTheme, PopupVideo } from '../../../shared/components/video/PopupVideo';
import { Image, Theme, useServer } from '../../server/ServerProvider';

export interface VideoBlockContent {
    text: {
        heading: string;
        body: string;
    };
    textPosition: 'left' | 'bottom';
    ratio: '16-9' | '3-2';
    image: Image;
    video: string;
    theme: Theme;
    dialogTheme: DialogTheme;
}

export function VideoBlock(): ReactElement {

    const { content, scaleWidthRecommendation } = useServer<VideoBlockContent>();

    return (
        <PopupVideo
            heading={content.text.heading}
            body={content.text.body}
            textPosition={content.textPosition}
            url={content.video}
            ratio={content.ratio}
            dialogTheme={content.dialogTheme}
            BackgroundProps={{
                image: content.image,
                theme: content.theme,
                scaleWidth: scaleWidthRecommendation,
            }}
        />
    );

}
