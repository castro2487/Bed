import './Confirmation.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';
import { Button } from '../formFields/Button';
import { Paragraph } from '../typography/Paragraph';
import { Heading } from '../typography/Heading';
import { baseClass } from './RequestCatalog';

export interface ConfirmText {
    confirmHeader: string;
    confirmBody: string;
    buttonClose?: string;
}

interface Props {
    onCloseClick: () => void;
    text: ConfirmText;
    className?: string;
}

export const Confirmation = ({ onCloseClick, text, className }: Props): ReactElement => (
    <div className={clsx(baseClass, className)}>
        <div className="has-confirmation">
            <div className="content-wrapper">
                <Heading level={2} size="sm">{text.confirmHeader}</Heading>
                <Paragraph>{text.confirmBody}</Paragraph>
                <Button
                    onClick={onCloseClick}
                    color="secondary">
                    {text.buttonClose}
                </Button>
            </div>
        </div>
    </div>
);
