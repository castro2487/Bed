import './VideoSubscription.scss';

import React, { useState, ReactElement } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { useServer, Theme } from '../../../server/ServerProvider';
import { getTheme, getButtonColor } from '../../../../shared/muiTheme';
import { FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { Form } from './Form';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { Background } from '../../../../shared/components/Background';
import { TextColumns } from '../../../../shared/components/TextColumns';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';

export interface VideoSubscriptionContent {
    text: {
        heading: string;
        body: string;
        buttonText: string;
        videoSubscriptionConfirm: string;
        labelEmail: string;
        buttonSubmit: string;
    };
    columns: 1 | 2;
    textAlignment: 'left' | 'center';
    theme: Theme;
    buttonColor: ButtonColor;
}

export function VideoSubscription(): ReactElement {

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showNewsletterBlock, setShowNewsletterBlock] = useState(true);
    const { content: { text, columns, textAlignment, theme, buttonColor } } = useServer<VideoSubscriptionContent>();

    return (
        <Background theme={theme}>
            <div className="has-video-subscription">
                <TextColumns
                    text={{
                        heading: text.heading,
                        body: text.body,
                    }}
                    columns={columns}
                    textAlignment={textAlignment}
                />
                <ThemeProvider theme={getTheme(theme)}>
                    <div className="subscription-form">
                        <div className="content-wrapper">
                            {showNewsletterBlock ? (
                                <Button onClick={() => setShowNewsletterBlock(false)} color={buttonColor || getButtonColor(theme)}>{text.buttonText}</Button>
                            ) : (
                                showConfirmation ? (
                                    <Paragraph className="success-text">{text.videoSubscriptionConfirm}</Paragraph>
                                ) : (
                                    <FormProvider>
                                        <Form onFormSubmitted={() => setShowConfirmation(true)} text={text} />
                                    </FormProvider>
                                )
                            )}
                        </div>
                    </div>
                </ThemeProvider>
            </div>
        </Background>
    );

}
