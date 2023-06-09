import './WinterCampaignHero.scss';

import React, { ReactElement } from 'react';
import { Background } from '../../../shared/components/Background';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button } from '../../../shared/components/formFields/Button';
import { addSups } from '../../../shared/helpers';
import { Link, useServer } from '../../server/ServerProvider';

interface WinterCampaignHeroContent {
    heading: string;
    heading2: string;
    footerHeading: string;
    footerBody: string;
    footerLink: Link;
}

export default function WinterCampaignHero(): ReactElement {
    const { getTrackingClassId, content } = useServer<WinterCampaignHeroContent>();

    return (
        <Background theme="black-1" className="has-winter-campaign-hero">
            <header className="top-text">
                <p>{content.heading}</p>
                <div className="snowflake"></div>
                <Heading level={2} size="lg" className="heading">{addSups(content.heading2)}</Heading>
            </header>
            <div className="bottom-text">
                <h3 className="heading">{content.footerHeading}</h3>
                <Paragraph>{content.footerBody}</Paragraph>
                <Button
                    className={getTrackingClassId('cta')}
                    appearance="simple"
                    color="secondary"
                    href={content.footerLink.url}>
                    {content.footerLink.text}
                </Button>
            </div>
        </Background>
    );
}
