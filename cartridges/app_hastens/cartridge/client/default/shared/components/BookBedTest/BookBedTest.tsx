import './BookBedTest.scss';

import React, { useState } from 'react';
import KingBedTwoTone from '@material-ui/icons/KingBedTwoTone';
import Schedule from '@material-ui/icons/Schedule';
import LocationOn from '@material-ui/icons/LocationOn';
import { ThemeProvider } from '@material-ui/core/styles';

import { FormProvider } from '../formFields/FormProvider';
import { Background } from '../Background';
import { darkTheme } from '../../muiTheme';
import { Heading } from '../typography/Heading';
import { Paragraph } from '../typography/Paragraph';
import { Image } from '../../../blocks/server/ServerProvider';
import { BookBedProvider } from './stateManagement';
import AnimatedSteps from '../AnimatedSteps';
import { SelectStoreForm } from './steps/SelectStoreForm';
import { UserForm } from './steps/UserForm';
import { Confirmation } from './steps/Confirmation';

interface Props {
    text: BookBedTestText;
    onCloseClick?: () => void;
    defaultStore?: string;
    defaultCountry?: string;
}

export interface BookBedTestText {
    heading: string;
    storeLocatorHeader: string;
    storeLocatorBody: string;
    storeLocatorNext: string;
    factsTimeHeader: string;
    factsTimeBody: string;
    factsParticipantHeader: string;
    factsParticipantBody: string;
    factsParticipantBody2: string;
    factsLocationHeader: string;
    factsLocationBody: string;
    userFormHeader: string;
    userFormBody: string;
    confirmationHeader: string;
    confirmationBody: string;
    confirmationClose: string;
    labelStore: string;
    labelCountry: string;
    labelFirstName: string;
    labelLastName: string;
    labelEmail: string;
    labelPhone: string;
    labelNewsLetter: string;
    labelRequired: string;
    labelConsent: string;
    buttonSubmit: string;
    buttonCancel: string;
}

enum Step { SELECT_STORE_FORM, USER_FORM, CONFIRMATION }

const image = {
    sizes: {
        desktop: {
            src: 'https://static.hastens.com/1500/blocks/catalog-bed-test/store-background-2400x1400.jpg',
        },
        tablet: {
            src: 'https://static.hastens.com/1200/blocks/catalog-bed-test/store-background-1200x1600.jpg',
        },
        mobile: {
            src: 'https://static.hastens.com/768/blocks/catalog-bed-test/store-background-1200x1600.jpg',
        },
    },
    alt: 'Book bed test image',
} as Image;

export function BookBedTest({ text, onCloseClick, defaultStore, defaultCountry }: Props) {
    const [activeStep, setActiveStep] = useState<Step>(0);
    return (
        <BookBedProvider>
            <FormProvider>
                <div className="has-book-bed-test-form">
                    <Background image={image} theme="primary-1">
                        <ThemeProvider theme={darkTheme}>
                            <div className="book-bed-test-content">
                                <Heading level={2} size="xs">{text.heading}</Heading>
                                <AnimatedSteps index={activeStep}>
                                    <SelectStoreForm
                                        text={text}
                                        onPrev={onCloseClick}
                                        onNext={() => {
                                            setActiveStep(Step.USER_FORM);
                                        }}
                                        defaultStore={defaultStore}
                                        defaultCountry={defaultCountry}
                                    />
                                    <UserForm
                                        text={text}
                                        onPrev={() => {
                                            setActiveStep(Step.SELECT_STORE_FORM);
                                        }}
                                        onNext={() => {
                                            setActiveStep(Step.CONFIRMATION);
                                        }}
                                    />
                                    <Confirmation
                                        text={text}
                                        onNext={() => {
                                            if (onCloseClick) {
                                                onCloseClick();
                                            } else {
                                                setActiveStep(Step.SELECT_STORE_FORM);
                                            }
                                        }}
                                    />
                                </AnimatedSteps>
                                <section className="info">
                                    <div>
                                        <Schedule />
                                        <Paragraph className="info-heading">{text.factsTimeHeader}</Paragraph>
                                        <Paragraph size="xs">{text.factsTimeBody}</Paragraph>
                                    </div>
                                    <div>
                                        <KingBedTwoTone />
                                        <Paragraph className="info-heading">{text.factsParticipantHeader}</Paragraph>
                                        <Paragraph size="xs">{text.factsParticipantBody}</Paragraph>
                                        <Paragraph size="xs">{text.factsParticipantBody2}</Paragraph>
                                    </div>
                                    <div>
                                        <LocationOn />
                                        <Paragraph className="info-heading">{text.factsLocationHeader}</Paragraph>
                                        <Paragraph size="xs">{text.factsLocationBody}</Paragraph>
                                    </div>
                                </section>
                            </div>
                        </ThemeProvider>
                    </Background>
                </div>
            </FormProvider>
        </BookBedProvider>
    );
}
