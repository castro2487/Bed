import './RequestCatalogCTA.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../../shared/components/Background';
import { Link, useServer } from '../../../server/ServerProvider';
import { Button } from '../../../../shared/components/formFields/Button';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';

interface RequestCatalogCTAContent {
    link: Link;
    text: {
        heading: string;
        intro: string;
        catalogText1: string;
        catalogText2: string;
        catalogText3: string;
    };
}

const defaultImageUrl = 'https://static.hastens.com/500/blocks/catalog-bed-test/catalog-extracted-1200x1200.jpg';
const usImageUrl = 'https://static.hastens.com/500/blocks/catalog-bed-test/catalog-extracted-us-1200x1200.jpg';

export function RequestCatalogCTA(): ReactElement {

    const { content: { text, link }, locale } = useServer<RequestCatalogCTAContent>();
    const imageUrl = locale === 'en_US' ? usImageUrl : defaultImageUrl;

    return (
        <Background theme="white-1">
            <div className="has-request-catalog-cta">
                <div className="top-container">
                    <Heading level={2} size="md" className="heading">{text.heading}</Heading>
                    <Paragraph className="intro">{text.intro}</Paragraph>
                    <Button
                        color="secondary"
                        href={link.url}>
                        {link.text}
                    </Button>
                </div>
                <div className="catalogue-image">
                    <Paragraph className="description-1">{text.catalogText1}</Paragraph>
                    <div className="image-wrapper">
                        <img src={imageUrl} alt="" />
                        <div className="line-1"/>
                        <div className="line-2"/>
                        <div className="line-3"/>
                    </div>
                    <Paragraph className="description-2">{text.catalogText2}</Paragraph>
                    <Paragraph className="description-3">{text.catalogText3}</Paragraph>
                </div>
            </div>
        </Background>
    );
}


