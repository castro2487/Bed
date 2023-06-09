import './DremerCampaignQuote.scss';

import React, { ReactElement } from 'react';

import { VideoScrollBackground } from '../../../shared/components/VideoScrollBackground';
import { useServer } from '../../server/ServerProvider';

interface ServerContent {
    quote: string;
    quoteBy: string;
}

export default function DremerCampaignQuote(): ReactElement {
    const server = useServer<ServerContent>();

    return (
        <VideoScrollBackground
            sources={[
                { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/quote-video-bg_1.ogv', type: 'video/ogg' },
                { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/quote-video-bg_1.mp4', type: 'video/mp4' },
            ]}
            className="has-dremer-campaign__quote">
            <p>{server.content.quote}</p>
            <p>{server.content.quoteBy}</p>
        </VideoScrollBackground>
    );
}
