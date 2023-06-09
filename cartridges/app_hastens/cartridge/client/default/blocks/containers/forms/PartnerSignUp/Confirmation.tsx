import React from 'react';
import { Button } from '../../../../shared/components/formFields/Button';
import { PartnerSignUpTexts } from './PartnerSignUp';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';

interface Props {
    onButtonClick: () => void;
    text: Pick<PartnerSignUpTexts, 'confirmationHeading' | 'confirmationBody' | 'buttonClose'>;
}

export function Confirmation({ onButtonClick, text }: Props) {
    return (
        <div className="slim thank-you-container">
            <Heading level={2}>{text.confirmationHeading}</Heading>
            <Paragraph>{text.confirmationBody}</Paragraph>

            <div className="button-container">
                <Button
                    color="secondary"
                    onClick={onButtonClick}>
                    {text.buttonClose}
                </Button>
            </div>
        </div>
    );
}
