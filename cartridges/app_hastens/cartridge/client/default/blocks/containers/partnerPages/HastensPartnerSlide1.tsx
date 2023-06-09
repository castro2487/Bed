import React from 'react';

import './PartnerPageSlideShow.scss';
import { useServer } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button } from '../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../shared/muiTheme';

interface HastensPartnerSlide1Content {
    text: {
        readMore: string;
        sleepBetterSleep: string;
        header: string;
        pitchText: string;
    };
    sleepBetterUrl: string;
}

export function HastensPartnerSlide1() {
    const { content: { text, sleepBetterUrl } } = useServer<HastensPartnerSlide1Content>();
    const images = {
        sizes: {
            mobile: { src: 'https://static.hastens.com/768/uploads/images/SBLB_heroimg_1200x1700.jpg' },
            tablet: {
                src: 'https://static.hastens.com/1200/uploads/images/SBLB_heroimg_1200x1700.jpg',
                focalPoint: {
                    x: 50,
                    y: 70,
                },
            },
            desktop: { src: 'https://static.hastens.com/1440/uploads/images/SBLB_heroimg_2400x1350.jpg' },
        },
    };

    return (
        <Background image={images} theme="primary-1">
            <div className="has-hastens-partner-slide-1">
                <div className="content">
                    <Heading level={2} size="xl" className="header">{text.header}</Heading>
                    <Paragraph size="lg" className="body">{text.pitchText}</Paragraph>
                    <Button href={sleepBetterUrl} color={getButtonColor('primary-1')}>
                        <span className="sr-only">{text.header}</span>
                        {text.readMore}
                    </Button>
                </div>
            </div>
        </Background>
    );
}
