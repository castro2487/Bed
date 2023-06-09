import './Banner.scss';

import React, { ReactElement } from 'react';

import { Button } from '../../../../shared/components/formFields/Button';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { useServer } from '../../../server/ServerProvider';
import { CatalogPopupContent } from './CatalogPopup';

interface Props {
    onClick: () => void;
}

export function Banner(props: Props): ReactElement {
    const { content } = useServer<CatalogPopupContent>();

    return (
        <div className="has-catalog-popup__banner">
            <img src={content.text.imgContent} alt=""/>
            <div className="text-wrapper">
                <h2>{content.text.bannerHeading}</h2>
                <Paragraph>{content.text.bannerBody}</Paragraph>
                <Button onClick={props.onClick}>{content.text.bannerCta}</Button>
            </div>
        </div>
    );
}
