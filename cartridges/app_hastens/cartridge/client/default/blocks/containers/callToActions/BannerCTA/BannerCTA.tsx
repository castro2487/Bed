import './BannerCTA.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Background } from '../../../../shared/components/Background';
import { useServer, Image, Link, Theme } from '../../../server/ServerProvider';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../../shared/muiTheme';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';

interface BannerCTAContent {
    image: Image;
    link: Link;
    theme: Theme;
    buttonColor: ButtonColor;
    textPosition: string;
    buttonAppearance: 'standard' | 'simple';
    text: {
        heading?: string;
        body?: string;
    };
}

export function BannerCTA(): ReactElement {
    const { getTrackingClassId, content: {
        theme, buttonColor, image, text, link, buttonAppearance, textPosition,
    } } = useServer<BannerCTAContent>();

    return (
        <Background image={image} theme={theme}>
            <div className="has-banner-cta">
                <div className={clsx(['content-wrapper', (textPosition || 'left')])}>
                    {text.heading && (
                        <Heading level={2} size={text.body ? 'sm' : 'md'} className="heading">{text.heading}</Heading>
                    )}
                    {text.body && (
                        <Paragraph className="body">{text.body}</Paragraph>
                    )}
                    {link.url && (
                        <Button
                            className={clsx('link', getTrackingClassId('cta'))}
                            href={link.url}
                            disablePageReload={link.disablePageReload}
                            color={buttonColor || getButtonColor(theme)}
                            appearance={buttonAppearance}>
                            {link.text}
                        </Button>
                    )}
                </div>
            </div>
        </Background>
    );
}
