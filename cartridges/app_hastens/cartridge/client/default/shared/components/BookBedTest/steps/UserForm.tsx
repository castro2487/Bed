import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import { ThemeProvider } from '@material-ui/core/styles';
import { validate as validateEmail } from 'email-validator';

import { useBookBedDispatch, useBookBedState } from '../stateManagement';
import { useServer } from '../../../../blocks/server/ServerProvider';
import { BookBedTestText } from '../BookBedTest';
import { useForm } from '../../formFields/FormProvider';
import { gtmEvent, parsePhoneNumberFromString, sfmcEvent } from '../../../helpers';
import { Heading } from '../../typography/Heading';
import { Paragraph } from '../../typography/Paragraph';
import { FormField } from '../../formFields/FormField';
import { TextField, TextFieldProps } from '../../formFields/TextField';
import { emailValidator, phoneNumberValidator, requiredValidator } from '../../formFields/validators';
import { PhoneField, PhoneFieldProps } from '../../formFields/PhoneField';
import { CheckboxField } from '../../formFields/CheckboxField';
import { RecaptchaField, RecaptchaFieldProps } from '../../formFields/RecaptchaField';
import { Button } from '../../formFields/Button';
import { darkTheme } from '../../../muiTheme';
import { fadeDuration } from '../../AnimatedSteps';

interface UserFormContent {
    onPrev: () => void;
    onNext: () => void;
    text: BookBedTestText;
}

export function UserForm({ text, onNext, onPrev }: UserFormContent) {

    const form = useForm();
    const appState = useBookBedState();
    const dispatch = useBookBedDispatch();
    const { catalogService, marketingCampaignService, pageId } = useServer();

    useEffect(() => {
        if (validateEmail(appState.formData.email)) {
            getEmailMarketingConsent(appState.formData.email);
        }
    }, [appState.formData.email]);

    function getEmailMarketingConsent(email) {
        catalogService.checkEmailMarketingConsent({ email }).then((consent) => {
            dispatch({ type: 'updateForm', data: { newsLetter: Boolean(consent.isMarketingConsentGiven) } });
            dispatch({ type: 'updateState', data: { isConsentBoxVisible: !Boolean(consent.isMarketingConsentGiven) } });
        });
    }

    function onPhoneChange(phone: string) {
        parsePhoneNumberFromString(phone).then((validatedNumber) => {
            const updatedState: any = {
                ...appState.formData,
                mobileNumber: phone,
                phonePrefix: null,
                telephone: null,
            };

            if (validatedNumber) {
                updatedState.phonePrefix = validatedNumber.isValid() ? validatedNumber.countryCallingCode : null;
                updatedState.telephone = validatedNumber.isValid() ? validatedNumber.nationalNumber : null;
            }

            dispatch({ type: 'updateForm', data: updatedState });
        });
    }

    function requestBedTest() {
        dispatch({ type: 'updateState', data: { processing: true } });

        const requestData = { ...appState.formData };

        if (requestData.mobileNumber !== undefined) {
            delete requestData.mobileNumber;
        }
        const urlParams = new URLSearchParams(window.location.search);
        if (pageId) {
            requestData.pageId = pageId;
        } else if (window.location.href.indexOf('partner-page') && urlParams.get('s')) {
            requestData.pageId = 'partner-page/' + urlParams.get('s');
        }

        // Make sure that either both phonePrefix and telephone are specified, or none
        requestData.phonePrefix = requestData.phonePrefix && requestData.telephone ? requestData.phonePrefix : '';
        requestData.telephone = requestData.phonePrefix && requestData.telephone ? requestData.telephone : '';

        marketingCampaignService.bookBedTest(requestData).then((response: any) => {
            if (response) {
                onNext();
                gtmEvent('storeLocatorSendVisitRequest');
                sfmcEvent('bookBedTestEndEvent');
                if (requestData.newsLetter && appState.isConsentBoxVisible) {
                    gtmEvent('signUpForNewsLetter');
                }
                dispatch({ type: 'updateState', data: { processing: false } });
                setTimeout(() => {
                    dispatch({ type: 'resetForm' });
                }, fadeDuration);
            }
        }, () => {
            dispatch({ type: 'updateState', data: { processing: false } });
        });
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="step-header">
                <Heading level={3} size="md">{text.userFormHeader}</Heading>
                <Paragraph>{text.userFormBody}</Paragraph>
            </div>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <FormField<TextFieldProps>
                        label={text.labelFirstName}
                        component={TextField}
                        validators={[requiredValidator]}
                        value={appState.formData.firstname}
                        onChange={(value) => dispatch({ type: 'updateForm', data: { firstname: value } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField<TextFieldProps>
                        label={text.labelLastName}
                        component={TextField}
                        validators={[requiredValidator]}
                        value={appState.formData.lastname}
                        onChange={(value) => dispatch({ type: 'updateForm', data: { lastname: value } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField<TextFieldProps>
                        label={text.labelEmail}
                        component={TextField}
                        validators={[requiredValidator, emailValidator]}
                        value={appState.formData.email}
                        onChange={(value) => dispatch({ type: 'updateForm', data: { email: value } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField<PhoneFieldProps>
                        label={text.labelPhone}
                        component={PhoneField}
                        country={appState.formData.country}
                        validators={[requiredValidator]}
                        asyncValidators={[phoneNumberValidator]}
                        value={appState.formData.mobileNumber}
                        onChange={(value) => {onPhoneChange(value);}}
                    />
                </Grid>
            </Grid>
            <Paragraph size="xs" className="required-text">*{text.labelRequired}</Paragraph>
            <Paragraph size="xs" className="consent-text">{text.labelConsent}</Paragraph>
            <Fade in={appState.isConsentBoxVisible} unmountOnExit appear>
                <div className="newsletter-checkbox">
                    <CheckboxField
                        labelPlacement="end"
                        label={text.labelNewsLetter}
                        checked={appState.formData.newsLetter}
                        onChange={(checked) => dispatch({ type: 'updateForm', data: { newsLetter: checked } })}
                    />
                </div>
            </Fade>
            <FormField<RecaptchaFieldProps>
                component={RecaptchaField}
                validators={[requiredValidator]}
                value={appState.formData.recaptcha}
                onChange={(value) => dispatch({ type: 'updateForm', data: { recaptcha: value } })}
            />
            <div className="buttons">
                <Button
                    type="button"
                    color="secondary"
                    onClick={() => {
                        onPrev();
                    }}>
                    {text.buttonCancel}
                </Button>
                <Button
                    type="button"
                    color="secondary"
                    onClick={() => requestBedTest()}
                    disabled={!form.isValid()}
                    pending={appState.processing}>
                    {text.buttonSubmit}
                </Button>
            </div>
        </ThemeProvider>
    );
}
