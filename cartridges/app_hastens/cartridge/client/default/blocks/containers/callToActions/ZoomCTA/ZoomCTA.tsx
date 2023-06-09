import './ZoomCTA.scss';

import React, { ReactElement } from 'react';
import { Background } from '../../../../shared/components/Background';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { useServer, Image, Link, Theme } from '../../../server/ServerProvider';
import { getButtonColor } from '../../../../shared/muiTheme';
import { Heading } from '../../../../shared/components/typography/Heading';

interface ZoomCTAContent {
    image: Image;
    link: Link;
    theme: Theme;
    buttonColor: ButtonColor;
    text: {
        heading: string;
    };
}

export function ZoomCTA(): ReactElement {
    const server = useServer<ZoomCTAContent>();

    return (
        <a className="has-zoom-cta" href={server.content.link.url}>
            <Background zoomable image={server.content.image} theme={server.content.theme} scaleWidth={server.scaleWidthRecommendation}>
                <div className="spacer">
                    <div className="content-wrapper">
                        <div className="text">
                            {server.content.text.heading && (
                                <Heading level={2} size="md" className="heading">{server.content.text.heading}</Heading>
                            )}
                            <Button
                                withArrow
                                appearance="simple"
                                color={server.content.buttonColor || getButtonColor(server.content.theme)}>
                                {server.content.link.text}
                            </Button>
                        </div>
                    </div>
                </div>
            </Background>
        </a>
    );
}
