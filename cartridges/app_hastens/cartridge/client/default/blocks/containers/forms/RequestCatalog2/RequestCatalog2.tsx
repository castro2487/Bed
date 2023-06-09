import './RequestCatalog2.scss';

import React, { useState } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

import { Button } from '../../../../shared/components/formFields/Button';
import { RequestCatalog, RequestCatalogTexts } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import { Confirmation, ConfirmText } from '../../../../shared/components/RequestCatalog/Confirmation';
import { useServer } from '../../../server/ServerProvider';
import { makeParagraphs } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import { lightTheme } from '../../../../shared/muiTheme';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';

interface RequestCatalog2Texts extends RequestCatalogTexts {
    heading: string;
    body: string;
    buttonRequestCatalog: string;
}

interface RequestCatalog2Content {
    text: RequestCatalog2Texts & ConfirmText;
}

enum Step { BUTTON, FORM, CONFIRMATION }

export function RequestCatalog2() {

    const { content: { text } } = useServer<RequestCatalog2Content>();
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="has-request-catalogue-2">
            <div className="content-wrapper">
                {text.heading && (
                    <Heading level={2} size="md" className="heading">{text.heading}</Heading>
                )}
                {text.body && (
                    <div className="body">{makeParagraphs(text.body)}</div>
                )}
                <AnimatedSteps index={activeStep}>
                    <div className="button-container">
                        <Button
                            color="dark"
                            onClick={() => {
                                setActiveStep(Step.FORM);
                            }}>
                            {text.buttonRequestCatalog}
                        </Button>
                    </div>
                    <ThemeProvider theme={lightTheme}>
                        <RequestCatalog
                            onCancelClick={() => {
                                setActiveStep(Step.BUTTON);
                            }}
                            onFormSuccess={() => {
                                setActiveStep(Step.CONFIRMATION);
                            }}
                            text={{
                                formHeader: text.formHeader,
                                formSubHeader: text.formSubHeader,
                                buttonCancel: text.buttonCancel,
                                buttonSend: text.buttonSend,
                                labelFirstName: text.labelFirstName,
                                labelLastName: text.labelLastName,
                                labelEmail: text.labelEmail,
                                labelPhone: text.labelPhone,
                                labelStreetAddress: text.labelStreetAddress,
                                labelApartment: text.labelApartment,
                                labelState: text.labelState,
                                labelCity: text.labelCity,
                                labelCountry: text.labelCountry,
                                labelZip: text.labelZip,
                                labelLanguage: text.labelLanguage,
                                labelNewsletter: text.labelNewsletter,
                                labelRequired: text.labelRequired,
                                labelConsent: text.labelConsent,
                            }}
                        />
                    </ThemeProvider>
                    <Confirmation
                        onCloseClick={() => {
                            setActiveStep(Step.BUTTON);
                        }}
                        text={{
                            confirmHeader: text.confirmHeader,
                            confirmBody: text.confirmBody,
                            buttonClose: text.buttonClose,
                        }}
                    />
                </AnimatedSteps>
            </div>
            <div className="bottom-image"></div>
        </div>
    );
}
