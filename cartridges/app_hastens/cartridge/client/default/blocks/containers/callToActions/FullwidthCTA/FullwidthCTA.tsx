import './FullwidthCTA.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Background } from '../../../../shared/components/Background';
import { useServer, Image, Link, Theme } from '../../../server/ServerProvider';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../../shared/muiTheme';
import { Heading } from '../../../../shared/components/typography/Heading';
import { addSups } from '../../../../shared/helpers';

interface FullwidthCTAContent {
    backgroundImage: Image;
    theme: Theme;
    buttonColor: ButtonColor;
    buttonAppearance: 'standard' | 'simple';
    customBackgroundColor: string;
    link: Link;
    text: {
        heading: string;
        body: string;
    };
    desktopTextPosition: 'winter-top' | 'left-top' | 'left-center' | 'left-bottom' | 'center-top' | 'center-center' | 'center-bottom' | 'right-top' | 'right-center' | 'right-bottom';
    mobileTextPosition: 'top' | 'center' | 'bottom';
    desktopTextAlign: TextAlign;
    mobileTextAlign: TextAlign;
    headingSize: 'md' | 'lg' | 'xl';
    textShadow: boolean;
}

type TextAlign = 'left' | 'center' | 'right';

export function FullwidthCTA(): ReactElement {

    const server = useServer<FullwidthCTAContent>();

    return (
        <Background
            enableHighResolution
            image={server.content.backgroundImage}
            theme={server.content.theme}
            customTheme={{ backgroundColor: server.content.customBackgroundColor }}
            size="full-width">
            <div className="has-fullwidth-cta">
                <div
                    className={clsx(
                        'content-wrapper',
                        {
                            [`text-position--${server.content.desktopTextPosition}`]: server.content.desktopTextPosition,
                            [`mobile-text-position--${server.content.mobileTextPosition}`]: server.content.mobileTextPosition,
                            [`text-align--${server.content.desktopTextAlign}`]: server.content.desktopTextAlign,
                            [`mobile-text-align--${server.content.mobileTextAlign}`]: server.content.mobileTextAlign,
                            'text-shadow': server.content.textShadow,
                        },
                    )}>
                    <div className="main-text">
                        {server.content.text.heading && (
                            <Heading level={2} size={server.content.headingSize} className="heading">{addSups(server.content.text.heading)}</Heading>
                        )}
                        {server.content.text.body && (
                            <p className="body">{server.content.text.body}</p>
                        )}
                        {server.content.link.url && (
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
                </div>
            </div>
        </Background>
    );

}
