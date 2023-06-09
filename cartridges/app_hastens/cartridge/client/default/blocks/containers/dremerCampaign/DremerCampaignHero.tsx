import './DremerCampaignHero.scss';

import React, { ReactElement } from 'react';

import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { PopupVideo } from '../../../shared/components/video/PopupVideo';
import { useServer } from '../../server/ServerProvider';

interface ServerContent {
    body: string;
    heading2: string;
    body2: string;
}

export default function DremerCampaignHero(): ReactElement {
    const server = useServer<ServerContent>();

    return (
        <div className="has-dremer-campaign__hero">
            <PopupVideo BackgroundProps={{ className: 'dremer-video' }} url="https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/intro-dremer-top-video_1.mp4" />
            <div className="intro-text">
                <Paragraph size="lg">{server.content.body}</Paragraph>
            </div>
            <div className="column-text">
                <div className="image-column" />
                <div className="text-column">
                    <h2>{server.content.heading2}</h2>
                    <Paragraph>{server.content.body2} </Paragraph>
                </div>
            </div>
        </div>
    );
}
