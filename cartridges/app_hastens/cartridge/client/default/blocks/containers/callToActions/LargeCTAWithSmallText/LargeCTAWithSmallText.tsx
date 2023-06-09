import './LargeCTAWithSmallText.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../../shared/components/Background';
import { useServer, Image, Link, VerticalAlignment, Theme } from '../../../server/ServerProvider';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../../shared/muiTheme';

interface LargeCTAWithSmallTextContent {
    image: Image;
    link: Link;
    verticalAlignment: VerticalAlignment;
    theme: Theme;
    buttonColor: ButtonColor;
    text: {
        heading: string;
    };
}

export function LargeCTAWithSmallText(): ReactElement {
    const server = useServer<LargeCTAWithSmallTextContent>();

    return (
        <Background image={server.content.image} theme={server.content.theme}>
            <div className="has-large-cta-with-small-text">
                <div className="content-wrapper">
                    <div className="text">
                        {server.content.text.heading && (
                            <h2 className="heading">{server.content.text.heading}</h2>
                        )}
                        {server.content.link.url && (
                            <Button
                                href={server.content.link.url}
                                color={server.content.buttonColor || getButtonColor(server.content.theme)}>
                                {server.content.link.text}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Background>
    );
}
