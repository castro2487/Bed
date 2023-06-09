import './Banner.scss';

import React from 'react';

import { Heading } from '../../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { Button } from '../../../../../shared/components/formFields/Button';
import { Background } from '../../../../../shared/components/Background';
import { useServer } from '../../../../server/ServerProvider';
import { ServerContent } from '../PartnerPagePrivateSession';

interface Props {
    onButtonClick: () => void;
}

export default function Banner(props: Props) {

    const { content } = useServer<ServerContent>();

    const image = {
        sizes: {
            desktop: { src: 'https://static.hastens.com/1500/blocks/private-session/bg-appointment.jpg' },
            tablet: { src: 'https://static.hastens.com/1200/blocks/private-session/bg-appointment.jpg' },
            mobile: { src: 'https://static.hastens.com/768/blocks/private-session/bg-book-appointment.jpg' },
        },
    };

    return (
        <Background image={image} theme="black-1">
            <div className="has-partner-page_private-session_banner">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{content.texts.bannerHeading}</Heading>
                    <Paragraph className="body">{content.texts.bannerBody}</Paragraph>
                    <Button
                        color="light"
                        onClick={props.onButtonClick}>
                        {content.texts.bannerButton}
                    </Button>
                </div>
            </div>
        </Background>
    );

}
