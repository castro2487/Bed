import React, { ReactElement, useState, Fragment, useEffect } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ThemeProvider } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

import './PartnerSignUp.scss';
import { Confirmation } from './Confirmation';
import { darkTheme } from '../../../../shared/muiTheme';
import { Button } from '../../../../shared/components/formFields/Button';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { TextField, TextFieldProps } from '../../../../shared/components/formFields/TextField';
import { PhoneField, PhoneFieldProps } from '../../../../shared/components/formFields/PhoneField';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../shared/components/formFields/RecaptchaField';
import { AutocompleteField, AutocompleteFieldProps } from '../../../../shared/components/formFields/AutocompleteField';
import { FormProvider, FormContext } from '../../../../shared/components/formFields/FormProvider';
import { requiredValidator, emailValidator, phoneNumberValidator } from '../../../../shared/components/formFields/validators';
import { AutosizeTextField, AutosizeTextFieldProps } from '../../../../shared/components/formFields/AutosizeTextField';
import { useServer } from '../../../server/ServerProvider';
import { PartnerSignUpData } from '../../../server/PartnerService';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import { gtmEvent, parsePhoneNumberFromString } from '../../../../shared/helpers';
import Link from '../../../../shared/components/Link';
import AnimatedSteps, { fadeDuration } from '../../../../shared/components/AnimatedSteps';

const initialFormValue = {
    firstName: '',
    lastName: '',
    email: '',
    mobile: null,
    country: null,
    description: '',
    marketingConsent: false,
    recaptcha: '',
};

export interface PartnerSignUpTexts {
    heading: string;
    body: string;
    confirmationHeading: string;
    confirmationBody: string;
    labelCountry: string;
    labelFirstName: string;
    labelLastName: string;
    labelEmail: string;
    labelPhone: string;
    labelAboutYou: string;
    labelCommunication: string;
    labelRequired: string;
    labelPrivacyPolicy: string;
    buttonClose: string;
    buttonSubmit: string;
}

interface PartnerSignUpContent {
    privacyLinkUrl: string;
    text: PartnerSignUpTexts;
}

export function PartnerSignUp(): ReactElement {

    const [telephone, setTelephone] = useState('');
    const [processing, setProcessing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [countriesList, setCountriesList] = useState([]);
    const [pendingCountriesList, setPendingCountriesList] = useState(false);
    const [defaultCountryCode, setDefaultCountryCode] = useState('');
    const [formData, setFormData] = useState<PartnerSignUpData>(initialFormValue);
    const { locationService, content, partnerService, content: { text }, getAllowedCountry } = useServer<PartnerSignUpContent>();

    useEffect(() => {
        setPendingCountriesList(true);
        locationService.getCountries().then(
            (countries) => {
                const allowedCountries = countries.map((country) => country.code);
                const defaultCountryCode = getAllowedCountry(allowedCountries);

                setCountriesList(countries.map((country) => ({ value: country.code, label: country.name })));
                setPendingCountriesList(false);
                setFormData((prevFormData) => ({ ...prevFormData, country: defaultCountryCode }));
                setDefaultCountryCode(defaultCountryCode);
            },
            () => {
                setPendingCountriesList(false);
            },
        );
    }, []);

    function onPartnershipRequest() {
        setProcessing(true);
        partnerService.submitApplication(formData).then((response: any) => {
            if (response) {
                gtmEvent('Newbusinessdevelopmentformsubmit');
                if (formData.marketingConsent) {
                    gtmEvent('signUpForNewsLetter');
                }
                setProcessing(false);
                setIsSubmitted(true);
                setTimeout(() => {
                    resetPageForm();
                }, fadeDuration);
            }
        }, () => {
            setProcessing(false);
        });
    }

    function resetPageForm() {
        setTelephone('');
        setFormData(initialFormValue);
    }

    function onChangeFormData(field: string, value: string | boolean) {
        setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
    }

    function onPhoneChange(phone: string) {
        parsePhoneNumberFromString(phone).then((validatedNumber) => {
            let mobileNo = null;
            if (validatedNumber && validatedNumber.isValid()) {
                mobileNo = '00' + validatedNumber.countryCallingCode + validatedNumber.nationalNumber;
            }
            setFormData((prevFormData) => ({ ...prevFormData, mobile: mobileNo }));
            setTelephone(phone);
        });
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <section className="has-partner-sign-up">
                <div className="container">
                    <AnimatedSteps index={isSubmitted ? 1 : 0}>
                        <Fragment>
                            <div>
                                <div className="step-header">
                                    <Heading level={2} size="md" className="heading">{text.heading}</Heading>
                                    <Paragraph className="body">{text.body}</Paragraph>
                                </div>
                            </div>
                            <div className="form">
                                <FormProvider>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <FormField<TextFieldProps>
                                                label={text.labelFirstName}
                                                component={TextField}
                                                validators={[
                                                    requiredValidator,
                                                ]}
                                                value={formData.firstName}
                                                onChange={(value) => {
                                                    onChangeFormData('firstName', value);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormField<TextFieldProps>
                                                label={text.labelLastName}
                                                component={TextField}
                                                validators={[
                                                    requiredValidator,
                                                ]}
                                                value={formData.lastName}
                                                onChange={(value) => {
                                                    onChangeFormData('lastName', value);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormField<TextFieldProps>
                                                label={text.labelEmail}
                                                component={TextField}
                                                validators={[requiredValidator, emailValidator]}
                                                value={formData.email}
                                                onChange={(value) => {
                                                    onChangeFormData('email', value);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormField<PhoneFieldProps>
                                                label={text.labelPhone}
                                                component={PhoneField}
                                                validators={[
                                                    requiredValidator,
                                                ]}
                                                asyncValidators={[phoneNumberValidator]}
                                                country={defaultCountryCode}
                                                value={telephone}
                                                onChange={(value) => {
                                                    onPhoneChange(value);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormField<AutocompleteFieldProps>
                                                label={text.labelCountry}
                                                component={AutocompleteField}
                                                validators={[requiredValidator]}
                                                pending={pendingCountriesList}
                                                disabled={pendingCountriesList}
                                                value={formData.country}
                                                options={countriesList}
                                                onChange={(selected) => {
                                                    onChangeFormData('country', selected);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} className="description-container">
                                            <FormField<AutosizeTextFieldProps>
                                                label={text.labelAboutYou}
                                                component={AutosizeTextField}
                                                rows={5}
                                                value={formData.description}
                                                onChange={(value) => {
                                                    onChangeFormData('description', value);
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} className="checkbox-container">
                                            <Paragraph size="xs" className="input-support">*{text.labelRequired}</Paragraph>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        color="default"
                                                        className="checkbox"
                                                        value={Boolean(formData.marketingConsent)}
                                                        checked={Boolean(formData.marketingConsent)}
                                                        onChange={({ target }) => {
                                                            onChangeFormData('marketingConsent', Boolean(target.checked));
                                                        }}
                                                    />
                                                }
                                                labelPlacement="end"
                                                label={
                                                    <span className="label">
                                                        {text.labelCommunication} <Link href={content.privacyLinkUrl} target="_blank">{text.labelPrivacyPolicy}</Link>
                                                    </span>
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} className="recaptcha-block">
                                            <FormField<RecaptchaFieldProps>
                                                component={RecaptchaField}
                                                validators={[requiredValidator]}
                                                value={formData.recaptcha}
                                                onChange={(value) => {
                                                    onChangeFormData('recaptcha', value);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} className="button-container">
                                            <FormContext.Consumer>
                                                {(context) => (
                                                    <Button
                                                        color="secondary"
                                                        pending={processing}
                                                        disabled={!context.isValid()}
                                                        onClick={() => onPartnershipRequest()}>
                                                        {text.buttonSubmit}
                                                    </Button>
                                                )}
                                            </FormContext.Consumer>
                                        </Grid>
                                    </Grid>
                                </FormProvider>
                            </div>
                        </Fragment>
                        <Confirmation onButtonClick={() => setIsSubmitted(false)} text={text}/>
                    </AnimatedSteps>
                </div>
            </section>
        </ThemeProvider>
    );

}
