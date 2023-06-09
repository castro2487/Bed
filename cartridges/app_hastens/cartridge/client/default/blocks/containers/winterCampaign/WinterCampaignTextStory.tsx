import './WinterCampaignTextStory.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Heading } from '../../../shared/components/typography/Heading';
import { Link, useServer } from '../../server/ServerProvider';

interface WinterCampaignTextStoryContent {
    heading: string;
    body: string;
    link: Link;
}

export default function WinterCampaignTextStory(): ReactElement {
    const { getTrackingClassId, content } = useServer<WinterCampaignTextStoryContent>();

    return (
        <Background theme="white-1" className="has-winter-campaign-text-story">
            <div className="content-wrapper">
                {content.heading && (
                    <Heading level={2} size="sm" className="heading">{content.heading}</Heading>
                )}
                {content.body && (
                    <Paragraph size="lg">{content.body}</Paragraph>
                )}
                {content.link.text && (
                    <Button
                        className={clsx('link', getTrackingClassId('cta'))}
                        color="dark"
                        href={content.link.url}>
                        {content.link.text}
                    </Button>
                )}
            </div>
        </Background>
    );
}
