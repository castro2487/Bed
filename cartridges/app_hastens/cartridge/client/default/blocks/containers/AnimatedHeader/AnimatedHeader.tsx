import './AnimatedHeader.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../shared/components/Background';
import { Theme, useServer } from '../../server/ServerProvider';
import { Heading } from '../../../shared/components/typography/Heading';

interface AnimatedHeader {
    heading: string;
    video: string;
    theme: Theme;
}

export function AnimatedHeader(): ReactElement {
    const { content } = useServer<AnimatedHeader>();

    return (
        <Background theme={content.theme}>
            <div className="has-animated-header">
                <video className="video" autoPlay playsInline loop muted>
                    <source src={encodeURI(content.video)} type="video/mp4"/>
                </video>
                {content.heading && (
                    <div className="section-text">
                        <Heading level={2} size="lg" className="heading">{content.heading}</Heading>
                    </div>
                )}
            </div>
        </Background>
    );
}
