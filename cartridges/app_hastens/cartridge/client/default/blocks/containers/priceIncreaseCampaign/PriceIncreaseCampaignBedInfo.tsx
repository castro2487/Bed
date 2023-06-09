import './PriceIncreaseCampaignBedInfo.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Link, useServer } from '../../server/ServerProvider';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button } from '../../../shared/components/formFields/Button';

interface PriceIncreaseCampaignBedInfoContent {
    heading: string;
    description: string;
    description2: string;
    priceBefore: string;
    priceBeforeDescription: string;
    priceAfter: string;
    priceAfterDescription: string;
    moneySaved: string;
    link: Link;
    imageCode: '2000t' | 'maranga' | 'superia';
    imagePosition: 'left' | 'right';
}

export default function PriceIncreaseCampaignBedInfo(): ReactElement {
    const { content, getTrackingClassId } = useServer<PriceIncreaseCampaignBedInfoContent>();

    return (
        <div className="has-price-increase-campaign__bed-info">
            <div
                className={clsx( 'grid-wrapper', `image-position--${content.imagePosition}`)}>
                <div className="grid-item">
                    <div className={clsx('image-content', `image--${content.imageCode}`)} />
                </div>
                <div className="grid-item">
                    <div className="text-content">
                        <div>
                            {content.heading && (
                                <h2>{content.heading}</h2>
                            )}
                            {content.description && (
                                <p className="description">{content.description}</p>
                            )}
                            {content.description2 && (
                                <Paragraph className="description-2">{content.description2}</Paragraph>
                            )}
                            {content.priceBefore && (
                                <div className="price-before">
                                    <p>{content.priceBefore}</p>
                                    <Paragraph>{content.priceBeforeDescription}</Paragraph>
                                </div>
                            )}
                            {content.priceAfter && (
                                <div className="price-after">
                                    <Paragraph>{content.priceAfter}</Paragraph>
                                    <Paragraph>{content.priceAfterDescription}</Paragraph>
                                </div>
                            )}
                            {content.moneySaved && (
                                <p className="money-saved">{content.moneySaved}</p>
                            )}
                            {content.link.text && (
                                <Button
                                    className={getTrackingClassId('cta')}
                                    appearance="simple"
                                    color="secondary"
                                    href={content.link.url}>
                                    {content.link.text}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
