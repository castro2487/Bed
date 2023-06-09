import './WinterCampaignCTA.scss';

import React, { ReactElement } from 'react';
import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Link, useServer } from '../../server/ServerProvider';
import clsx from 'clsx';

interface WinterCampaignCTAContent {
    heading: string;
    body: string;
    link: Link;
    image: 'excel' | '2000t';
}

export default function WinterCampaignCTA(): ReactElement {
    const { getTrackingClassId, content } = useServer<WinterCampaignCTAContent>();

    return (
        <Background theme="black-1" className={clsx('has-winter-campaign-cta', { [`background--${content.image}`]: content.image })}>
            <div className="content-wrapper">
                <h2 className="heading">{content.heading}</h2>
                <Paragraph>{content.body}</Paragraph>
                <Button
                    className={getTrackingClassId('cta')}
                    appearance="simple"
                    color="secondary"
                    href={content.link.url}>
                    {content.link.text}
                </Button>
            </div>
        </Background>
    );
}
