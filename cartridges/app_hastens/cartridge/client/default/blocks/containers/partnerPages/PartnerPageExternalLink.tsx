import React from 'react';

import './PartnerPageExternalLink.scss';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Image, Theme, useServer } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../shared/muiTheme';


interface StoreContent {
    store: {
        details: {
            image: string;
            url: string;
            header: string;
            text: string;
            'link-text': string;
            theme: Theme;
            align: string;
        }
        canShow: boolean;
    };
}

export function PartnerPageExternalLink() {
    const { content: { store: { canShow, details } } } = useServer<StoreContent>();
    const image = canShow && getImageForBackground(details?.image, details?.['link-text']);

    return canShow && details ? (
        <Background image={image} theme={details.theme}>
            <div className={`has-partner-external-link text-align-${details.align || 'center'}`}>
                <div className="content-wrapper">
                    {details.header && (
                        <Heading size="md" level={2}>{details.header}</Heading>
                    )}
                    <Paragraph className="px-lg-5 px-2">{details.text}</Paragraph>
                    <Button
                        href={details.url}
                        color={getButtonColor(details.theme)}>
                        {details['link-text']}
                    </Button>
                </div>
            </div>
        </Background>
    ) : null;
}


function getImageForBackground(imageUrl: string | null, linkText: string): Image | null {
    if (imageUrl) {
        return {
            sizes: {
                mobile: { src: imageUrl },
                tablet: { src: imageUrl },
                desktop: { src: imageUrl },
            },
            alt: linkText,
        };
    }
    return null;
}
