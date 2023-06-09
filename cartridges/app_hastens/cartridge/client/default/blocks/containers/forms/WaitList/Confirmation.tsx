import './Confirmation.scss';

import React, { ReactElement } from 'react';
import { Button } from '../../../../shared/components/formFields/Button';
import { useServer } from '../../../server/ServerProvider';
import { WaitListContent } from './WaitList';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';

interface Props {
    onCloseClick: () => void;
}

export function Confirmation({ onCloseClick }: Props): ReactElement {

    const { content } = useServer<WaitListContent>();

    return (
        <div className="has-wait-list-confirmation">
            <div className="content-wrapper">
                <Heading level={2} className="heading">{content.text.confirmationHeading}</Heading>
                <Paragraph>{content.text.confirmationBody}</Paragraph>
                <Button onClick={onCloseClick} color="secondary">{content.text.buttonClose}</Button>
            </div>
        </div>
    );

}
