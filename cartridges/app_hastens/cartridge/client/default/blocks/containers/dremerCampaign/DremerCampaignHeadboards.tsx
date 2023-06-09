import './DremerCampaignHeadboards.scss';

import React, { ReactElement, useState } from 'react';

import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { VideoScrollBackground } from '../../../shared/components/VideoScrollBackground';
import AnimatedSteps from '../../../shared/components/AnimatedSteps';
import DremerNewsletter from './DremerNewsletter/DremerNewsletter';
import { useServer } from '../../server/ServerProvider';
import { StringHelper } from '../../../shared/components/StringHelper';

interface ServerContent {
    body: string;
    details: string;
    ctaBody: string;
    newsletterCta: string;
    newsletterFormHeading: string;
    fallbackRequestCatalogUrl: string;
}

enum Step { CTA, FORM, CONFIRMATION }

export default function DremerCampaignHeadboards(): ReactElement {
    const [activeStep, setActiveStep] = useState<Step>(Step.CTA);
    const server = useServer<ServerContent>();

    return (
        <div className="has-dremer-campaign__headboards">
            <VideoScrollBackground
                sources={[
                    { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/headboard-video-bg_1.ogv', type: 'video/ogg' },
                    { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/headboard-video-bg_1.mp4', type: 'video/mp4' },
                ]}
                className="video-scroll-header">
                <div className="content-wrapper">
                    <h2 className="sr-only">drēmər headboard</h2>
                    <div className="dremer-logo" />
                </div>
            </VideoScrollBackground>
            <div className="column-text">
                <div className="text-column">
                    <Paragraph>{server.content.body}</Paragraph>
                </div>
                <div className="image-column" />
            </div>
            <ul className="headboards">
                <li className="black-shadow">
                    <div className="label">Black shadow</div>
                </li>
                <li className="traditional-blue">
                    <div className="label">Traditional blue</div>
                </li>
                <li className="phantom-charcoal">
                    <div className="label">Phantom charcoal</div>
                </li>
                <li className="natural-shale">
                    <div className="label">Natural shale</div>
                </li>
            </ul>
            <Paragraph size="xs" className="details">{server.content.details}</Paragraph>
            <AnimatedSteps index={activeStep}>
                <div className="newsletter-cta">
                    <p>
                        <StringHelper
                            parameters={[
                                <button
                                    key="link"
                                    className={server.getTrackingClassId('newsletter', 'cta')}
                                    onClick={() => {setActiveStep(Step.FORM);}}>
                                    {server.content.newsletterCta}
                                </button>,
                            ]}>
                            {server.content.ctaBody}
                        </StringHelper>
                    </p>
                </div>
                <DremerNewsletter
                    formHeading={server.content.newsletterFormHeading}
                    fallbackRequestCatalogUrl={server.content.fallbackRequestCatalogUrl}
                    onClose={() => {setActiveStep(Step.CTA);}}
                />
            </AnimatedSteps>
        </div>
    );
}
