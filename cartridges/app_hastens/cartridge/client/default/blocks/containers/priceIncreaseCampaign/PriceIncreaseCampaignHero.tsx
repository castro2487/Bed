import './PriceIncreaseCampaignHero.scss';

import React, { ReactElement } from 'react';
import { Background } from '../../../shared/components/Background';
import { Heading } from '../../../shared/components/typography/Heading';
import { useServer } from '../../server/ServerProvider';

interface PriceIncreaseCampaignHeroContent {
    heading: string;
    body: string;
}

export default function PriceIncreaseCampaignHero(): ReactElement {
    const { content } = useServer<PriceIncreaseCampaignHeroContent>();

    return (
        <Background theme="black-1" className="has-price-increase-campaign__hero">
            <div className="content-wrapper">
                <Heading level={2} size="lg" className="heading">{content.heading}</Heading>
                <p>{content.body}</p>
            </div>
            <div className="image" />
        </Background>
    );
}
