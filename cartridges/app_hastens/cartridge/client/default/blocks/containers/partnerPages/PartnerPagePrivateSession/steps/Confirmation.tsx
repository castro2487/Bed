import './Confirmation.scss';

import React from 'react';

import { Button } from '../../../../../shared/components/formFields/Button';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { useServer } from '../../../../server/ServerProvider';
import { ServerContent } from './../PartnerPagePrivateSession';
import { Heading } from '../../../../../shared/components/typography/Heading';

interface Props {
    onCloseClick: () => void;
}

export default function Confirmation(props: Props) {

    const { content } = useServer<ServerContent>();

    return (
        <div className="has-partner-page_private-session_confirmation">
            <div className="content-wrapper">
                <Heading level={2} size="sm" className="heading">{content.texts.confirmationHeading}</Heading>
                <Paragraph className="body">{content.texts.confirmationBody}</Paragraph>
                <Button
                    color="dark"
                    onClick={props.onCloseClick}>
                    {content.texts.buttonClose}
                </Button>
            </div>
        </div>
    );

}
