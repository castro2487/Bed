import './VideoList.scss';

import Grid from '@material-ui/core/Grid';

import React, { ReactElement } from 'react';
import { Background } from '../../../shared/components/Background';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Image, Theme, useServer } from '../../server/ServerProvider';
import { PopupVideo } from '../../../shared/components/video/PopupVideo';

interface VideoListContent {
    heading: string;
    intro: string;
    videos: {
        url: string;
        name: string;
        image: Image;
    }[];
    theme: Theme;
}

export function VideoList(): ReactElement {

    const { content } = useServer<VideoListContent>();

    return (
        <Background theme={content.theme}>
            <div className="has-video-list">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{content.heading}</Heading>
                    <Paragraph className="intro">{content.intro}</Paragraph>
                    <Grid container spacing={1}>
                        {content.videos.map((video, index) => (
                            <Grid key={index} item xs={12} md={6}>
                                <div className="video-wrapper">
                                    <PopupVideo
                                        url={video.url}
                                        BackgroundProps={{ image: video.image, theme: 'grey-4' }}
                                    />
                                    {video.name && (
                                        <p className="name">{video.name}</p>
                                    )}
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>
        </Background>
    );
}
