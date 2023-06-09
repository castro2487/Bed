import './ShopHeader.scss';

import React, { ReactElement } from 'react';

import { Image, Theme, CustomTheme, useServer } from '../../server/ServerProvider';
import { Heading } from '../../../shared/components/typography/Heading';
import { Background } from '../../../shared/components/Background';

interface ShopHeaderContent {
    heading: string;
    image: Image;
    theme: Theme;
    customTheme: CustomTheme;
}

export function ShopHeader(): ReactElement {
    const { content } = useServer<ShopHeaderContent>();

    return (
        <Background
            className="has-shop-header"
            image={content.image}
            theme={content.theme}
            customTheme={content.customTheme}>
            <div className="content-wrapper">
                <div className="inner-content-wrapper">
                    <Heading level={2} size="md">{content.heading}</Heading>
                </div>
            </div>
        </Background>
    );
}
