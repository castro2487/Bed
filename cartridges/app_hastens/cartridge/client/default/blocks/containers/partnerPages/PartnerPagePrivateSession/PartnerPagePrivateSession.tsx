import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';

import Banner from './steps/Banner';
import TimeSlots from './steps/TimeSlots';
import PersonalData from './steps/PersonalData';
import Confirmation from './steps/Confirmation';
import { FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { PrivateSessionRequestData } from '../../../server/PrivateSessionService';
import { useServer } from '../../../server/ServerProvider';
import AnimatedSteps, { fadeDuration } from '../../../../shared/components/AnimatedSteps';

export interface ServerContent {
    texts: {
        buttonClose: string;
        buttonCancel: string;
        buttonSendRequest: string;
        buttonNext: string;
        labelFirstName: string;
        labelLastName: string;
        labelEmail: string;
        labelPhone: string;
        labelRequired: string;
        labelConsent: string;
        bannerHeading: string;
        bannerBody: string;
        bannerButton: string;
        formHeading: string;
        formBody: string;
        noTimeSlots: string;
        confirmationHeading: string;
        confirmationBody: string;
    };
    store: {
        partnerSlug: string;
    };
}

enum Step { BANNER, TIME_SLOTS, PERSONAL_DATA, CONFIRMATION }

const useStyles = makeStyles(() => createStyles({
    root: {
        background: '#eee',
        color: '#000',
    },
}));

export const dateFormat = 'YYYY-MM-DD';

export default function PartnerPagePrivateSession() {

    const classes = useStyles();
    const { content, locationService, getAllowedCountry } = useServer<ServerContent>();
    const [phoneInput, setPhoneInput] = useState('');
    const [countryInput, setCountryInput] = useState<string>();
    const [activeStep, setActiveStep] = useState(0);

    const defaultFormData = {
        partnerSlug: content.store.partnerSlug,
        date: dayjs().format(dateFormat),
        preferredLanguage: getAllowedCountry(),
    } as PrivateSessionRequestData;

    const [formData, setFormData] = useState<PrivateSessionRequestData>(defaultFormData);

    useEffect(() => {
        locationService.getCountries().then((countries) => {
            if (countries) {
                const allowedCountries = countries.map((country) => country.code);
                setCountryInput(getAllowedCountry(allowedCountries));
            }
        });
    }, []);

    function resetForm() {
        setFormData(defaultFormData);
        setPhoneInput('');
    }

    return (
        <div className={classes.root}>
            <AnimatedSteps index={activeStep}>
                <Banner
                    onButtonClick={() => {
                        setActiveStep(Step.TIME_SLOTS);
                    }}
                />
                <TimeSlots
                    formData={formData}
                    onChangeFormData={(nextFormData) => {
                        setFormData((prevFormData) => ({ ...prevFormData, ...nextFormData }));
                    }}
                    onCancelClick={() => {
                        resetForm();
                        setActiveStep(Step.BANNER);
                    }}
                    onNextClick={() => {
                        setActiveStep(Step.PERSONAL_DATA);
                    }}
                />
                <FormProvider>
                    <PersonalData
                        formData={formData}
                        phoneInput={phoneInput}
                        countryInput={countryInput}
                        onChangePhone={(value) => {
                            setPhoneInput(value);
                        }}
                        onChangeFormData={(nextFormData) => {
                            setFormData((prevFormData) => ({ ...prevFormData, ...nextFormData }));
                        }}
                        onBackClick={() => {
                            setActiveStep(Step.TIME_SLOTS);
                        }}
                        onSubmitComplete={() => {
                            setActiveStep(Step.CONFIRMATION);
                            setTimeout(() => {
                                resetForm();
                            }, fadeDuration);
                        }}
                    />
                </FormProvider>
                <Confirmation
                    onCloseClick={() => {
                        setActiveStep(Step.BANNER);
                    }}
                />
            </AnimatedSteps>
        </div>
    );

}
