import './Banner.scss';

import React, { ReactElement } from 'react';

import { baseClass } from './RequestCatalog';
import { Background } from '../Background';
import { Heading } from '../typography/Heading';
import { Paragraph } from '../typography/Paragraph';
import { Button, ButtonColor } from '../formFields/Button';
import { Image, Theme } from '../../../blocks/server/ServerProvider';
import { getButtonColor } from '../../muiTheme';

export interface BannerTexts {
    bannerHeading: string;
    bannerBody: string;
    bannerButton: string;
}

interface Props {
    buttonClassName?: string;
    onButtonClick: () => void;
    image: Image;
    theme: Theme;
    buttonColor: ButtonColor;
    text: BannerTexts;
}

export function Banner({ onButtonClick, buttonClassName, text, image, theme, buttonColor }: Props): ReactElement {

    return (
        <div className={baseClass}>
            <Background theme={theme} image={image}>
                <div className="has-request-catalog-banner">
                    <div className="content-wrapper">
                        <Heading level={2} size="sm" className="heading">{text.bannerHeading}</Heading>
                        <Paragraph>{text.bannerBody}</Paragraph>
                        <Button
                            className={buttonClassName}
                            color={buttonColor || getButtonColor(theme)}
                            onClick={() => onButtonClick()}>
                            {text.bannerButton}
                        </Button>
                    </div>
                </div>
            </Background>
        </div>
    );

}
