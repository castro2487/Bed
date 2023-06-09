import './LargeCTA.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Background } from '../../../../shared/components/Background';
import { useServer, Image, Link, VerticalAlignment, Theme, HorizontalAlignment } from '../../../server/ServerProvider';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getPaletteType, getButtonColor } from '../../../../shared/muiTheme';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import { AppStoreButton } from '../../../../shared/components/formFields/AppStoreButton/AppStoreButton';
import { addSups } from '../../../../shared/helpers';

interface LargeCTAContent {
    image: Image;
    link: Link;
    headingSize: 'md' | 'lg' | 'xl';
    verticalAlignment: VerticalAlignment;
    verticalAlignmentMobile: VerticalAlignment;
    horizontalAlignment: HorizontalAlignment;
    theme: Theme;
    buttonColor: ButtonColor;
    buttonAppearance: 'standard' | 'simple' | 'appleAppStore';
    pushButtonToBottom: boolean;
    pushButtonToBottomOnMobile: boolean;
    textShadow: boolean;
    text: {
        heading: string;
        afterHeading: string;
        body: string;
        footer: string;
    };
}

export function LargeCTA(): ReactElement {
    const server = useServer<LargeCTAContent>();

    return (
        <Background image={server.content.image} theme={server.content.theme}>
            <div className="has-large-cta">
                <div className="content-wrapper">
                    <div
                        className={clsx(
                            'main-text',
                            server.content.verticalAlignment ? `vertical-alignment--${server.content.verticalAlignment}` : null,
                            server.content.verticalAlignmentMobile ? `vertical-alignment--${server.content.verticalAlignmentMobile}-mobile` : null,
                            server.content.pushButtonToBottom ? `push-button-bottom` : null,
                            server.content.pushButtonToBottomOnMobile ? `push-button-bottom-mobile` : null,
                            server.content.horizontalAlignment ? `horizontal-alignment--${server.content.horizontalAlignment}` : null,
                            server.content.textShadow ? 'text-shadow' : null,
                        )}>
                        <div>
                            {server.content.text.heading && (
                                <header>
                                    <Heading level={2} size={server.content.headingSize} className="heading">{addSups(server.content.text.heading)}</Heading>
                                    {server.content.text.afterHeading && (
                                        <p>{server.content.text.afterHeading}</p>
                                    )}
                                </header>
                            )}
                            {server.content.text.body && (
                                <Paragraph size="lg" className="body">{server.content.text.body}</Paragraph>
                            )}
                            {server.content.link.url && (
                                <div className="links">
                                    {server.content.buttonAppearance === 'appleAppStore' ? (
                                        <AppStoreButton
                                            href={server.content.link.url}
                                            theme={getPaletteType(server.content.theme)}
                                        />
                                    ) : (
                                        <Button
                                            className={server.getTrackingClassId('cta')}
                                            href={server.content.link.url}
                                            color={server.content.buttonColor || getButtonColor(server.content.theme)}
                                            appearance={server.content.buttonAppearance}>
                                            <span className="sr-only">{server.content.text.heading}</span>
                                            {server.content.link.text}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {server.content.text.footer && (
                        <div className="bottom-text">
                            <p>{server.content.text.footer}</p>
                        </div>
                    )}
                </div>
            </div>
        </Background>
    );
}
