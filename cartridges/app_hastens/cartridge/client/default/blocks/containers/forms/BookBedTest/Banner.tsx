import './Banner.scss';

import React, { ReactElement } from 'react';

import { Image } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Button } from '../../../../shared/components/formFields/Button';

interface Props {
    onButtonClick: () => void;
    text: BookBedTestBannerText;
}

export interface BookBedTestBannerText {
    bannerHeading: string;
    bannerBody: string;
    bannerButton: string;
}

const image: Image = {
    sizes: {
        desktop: {
            src: 'https://static.hastens.com/1440/blocks/book-a-meeting/bed-test-2400x750.jpg',
        },
        tablet: {
            src: 'https://static.hastens.com/1200/blocks/book-a-meeting/bed-test-2400x750.jpg',
        },
        mobile: {
            src: 'https://static.hastens.com/768/blocks/book-a-meeting/bed-test-1200x1900.jpg',
        },
    },
};

export function Banner({ text, onButtonClick }: Props): ReactElement {
    return (
        <Background image={image} theme="primary-1">
            <div className="has-book-bed-test-banner">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{text.bannerHeading}</Heading>
                    <Paragraph>{text.bannerBody}</Paragraph>
                    <Button color="light"
                        onClick={onButtonClick}>
                        {text.bannerButton}
                    </Button>
                </div>
            </div>
        </Background>
    );
}
