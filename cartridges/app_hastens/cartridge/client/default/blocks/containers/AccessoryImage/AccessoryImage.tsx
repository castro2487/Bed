import './AccessoryImage.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { useServer, Image, Theme, ScaleWidth } from '../../server/ServerProvider';
import { getPaletteType } from '../../../shared/muiTheme';
import { Background } from '../../../shared/components/Background';

interface AccessoryGridContent {
    text: string;
    linkUrl: string;
    image: Image;
    theme?: Theme;
    textAlignment?: 'left' | 'right' | 'bottom';
    colspan: 'colspan-1' | 'colspan-2';
}

export function AccessoryImage(): ReactElement {
    const { content: {
        text, linkUrl, image, theme, textAlignment, colspan,
    } } = useServer<AccessoryGridContent>();

    return (
        <Background
            image={image}
            theme={theme}
            scaleWidth={{
                // TODO: Should take in parameters from grid to determine size
                desktop: colspan === 'colspan-2' ? ScaleWidth.W1100 : ScaleWidth.W500,
                tablet: ScaleWidth.W500,
                mobile: ScaleWidth.W400,
            }}>
            <div className="has-accessory-image">
                <a
                    href={linkUrl}
                    className={clsx({
                        'theme--dark': getPaletteType(theme) === 'dark',
                    })}>
                    <span className={`text-position--${textAlignment}`}>
                        {text}
                    </span>
                </a>
            </div>
        </Background>

    );
}
