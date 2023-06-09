import React from 'react';

import { Heading } from '../../typography/Heading';
import { Paragraph } from '../../typography/Paragraph';
import { Button } from '../../formFields/Button';
import { BookBedTestText } from '../BookBedTest';

interface ConfirmationContent {
    onNext: () => void;
    text: BookBedTestText;
}

export function Confirmation({ text, onNext }: ConfirmationContent) {
    return (
        <div className="confirmation">
            <div className="step-header">
                <Heading level={3} size="md">{text.confirmationHeader}</Heading>
                <Paragraph>{text.confirmationBody}</Paragraph>
            </div>
            <div className="buttons">
                <Button
                    type="button"
                    color="secondary"
                    onClick={onNext}>
                    {text.confirmationClose}
                </Button>
            </div>
        </div>
    );
}
