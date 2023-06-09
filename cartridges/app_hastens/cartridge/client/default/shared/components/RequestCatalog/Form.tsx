import './Form.scss';

import React, { useEffect, useState } from 'react';
import { validate as validateEmail } from 'email-validator';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

import { Button } from '../formFields/Button';
import { FormField } from '../formFields/FormField';
import { useForm } from '../formFields/FormProvider';
import { emailValidator, phoneNumberValidator, requiredValidator } from '../formFields/validators';
import { TextField, TextFieldProps } from '../formFields/TextField';
import { RecaptchaField, RecaptchaFieldProps } from '../formFields/RecaptchaField';
import { AutocompleteField, AutocompleteFieldProps } from '../formFields/AutocompleteField';
import { PhoneField, PhoneFieldProps } from '../formFields/PhoneField';
import { useServer } from '../../../blocks/server/ServerProvider';
import { CatalogRequestData } from '../../../blocks/server/CatalogService';
import { RequestCatalogTexts } from './RequestCatalog';
import { Paragraph } from '../typography/Paragraph';
import { Heading, HeadingSize } from '../typography/Heading';
import { parsePhoneNumberFromString, sfmcEvent, gtmEvent } from '../../helpers';
import { CheckboxField } from '../formFields/CheckboxField';

interface Props {
    cancelButtonClassName: string;
    submitButtonClassName: string;
    onFormSubmitted: () => void;
    onCancelClick: () => void;
    text: RequestCatalogTexts;
    headingSize?: HeadingSize;
    origin?: string;
}

export function Form(props: Props) {

    const server = useServer();
    const form = useForm();

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobileNumber: '',
        street: '',
        apartmentNumber: '',
        region: '',
        city: '',
        zipCode: '',
        country: null,
        phone: {
            countryCallingCode: null,
            phoneNumber: null,
        },
        catalogLanguage: null,
    });
    const [recaptcha, setRecaptcha] = useState('');
    const [emailConsent, setEmailConsent] = useState(false);
    const [defaultCountryCode, setDefaultCountryCode] = useState('');
    const [position, setPosition] = useState({
        method: 'geoip',
        longitude: null,
        latitude: null,
    });
    const [state, setState] = useState({
        isConsentBoxVisible: false,
        edited: false,
        pending: false,
        catalogLanguageOptions: [],
        countryOptions: [],
        pendingCountryOptions: false,
    });

    function updateState(updatedState) {
        setState((prevState) => ({ ...prevState, ...updatedState }));
    }

    function updateFormData(updatedState: any) {
        setFormData((prevFormData) => ({ ...prevFormData, ...updatedState }));
        if (!state.edited && !Object.keys(updatedState).includes('country')) {
            sfmcEvent('catalogRequestStartEvent');
            updateState({ edited: true });
        }
    }

    useEffect(() => {
        updateState({
            pendingCountryOptions: true,
            catalogLanguageOptions: server.catalogService.getCatalogLanguages(),
        });
        server.locationService.getCountries().then(
            (countries) => {
                if (countries) {
                    updateState({
                        countryOptions: countries.map((country) => ({ value: country.code, label: country.name })),
                        pendingCountryOptions: false,
                    });
                    const allowedCountries = countries.map((country) => country.code);
                    const defaultCountryCode = server.getAllowedCountry(allowedCountries);
                    updateFormData({ country: defaultCountryCode });
                    setDefaultCountryCode(defaultCountryCode);
                }
            },
            () => {
                updateState({ pendingCountryOptions: false });
            },
        );
        server.locationService.getPositionByIp().then((location) => {
            if (location && location.longitude && location.latitude) {
                setPosition({
                    method: 'geoip',
                    longitude: location.longitude,
                    latitude: location.latitude,
                });
            }
        });
    }, []);


    useEffect(() => {
        if (validateEmail(formData.email)) {
            getEmailMarketingConsent(formData.email);
        }
    }, [formData.email]);

    function requestCatalog() {
        updateState({ pending: true });
        const requestObject = makeRequestObject();
        server.catalogService.sendCatalogRequest(requestObject).then((response: any) => {
            if (response) {
                gtmEvent('requestACatalog');
                sfmcEvent('catalogRequestEndEvent');
                if (requestObject.consent && state.isConsentBoxVisible) {
                    gtmEvent('signUpForNewsLetter');
                }
                props.onFormSubmitted();
            }
        }, () => {
            updateState({ pending: false });
        });
    }

    function makeRequestObject(): CatalogRequestData {
        const {
            firstname, lastname, email, phone, street, apartmentNumber,
            region, city, zipCode, country, catalogLanguage,
        } = formData;

        const requestData: CatalogRequestData = {
            firstname,
            lastname,
            email,
            phonePrefix: phone.countryCallingCode,
            phone: phone.phoneNumber,
            recaptcha,
            street,
            apartmentNumber,
            region,
            city,
            zipCode,
            country,
            consent: emailConsent,
            formId: 'catreq1',
            position,
            catalogLanguage,
            originUrl: location.protocol + '//' + location.host + location.pathname,
        };

        if (props.origin) {
            requestData.origin = props.origin;
        }

        // Make sure that either both phonePrefix and phone are specified, or none
        requestData.phonePrefix = requestData.phonePrefix && requestData.phone ? requestData.phonePrefix : '';
        requestData.phone = requestData.phonePrefix && requestData.phone ? requestData.phone : '';

        return requestData;
    }

    function getEmailMarketingConsent(email) {
        server.catalogService.checkEmailMarketingConsent({ email }).then((consent) => {
            updateState({ isConsentBoxVisible: !Boolean(consent.isMarketingConsentGiven) });
            setEmailConsent(consent.isMarketingConsentGiven);
        });
    }

    function updatePhoneNumber(phoneNumber) {
        parsePhoneNumberFromString(phoneNumber).then((validatedNumber) => {
            const updatedState: any = {
                mobileNumber: phoneNumber,
                phone: {
                    countryCallingCode: null,
                    phoneNumber: null,
                },
            };

            if (validatedNumber) {

                updatedState.phone = {
                    countryCallingCode: validatedNumber.isValid() ? validatedNumber.countryCallingCode : null,
                    phoneNumber: validatedNumber.isValid() ? validatedNumber.nationalNumber : null,
                };
            }

            updateFormData(updatedState);
        });
    }

    return (
        <div className="has-request-catalog-form">
            <div className="content-wrapper">
                {props.text.formHeader && <Heading level={2} size={props.headingSize || 'md'} className="heading">{props.text.formHeader}</Heading>}
                {props.text.formSubHeader && <Paragraph className="intro">{props.text.formSubHeader}</Paragraph>}
                <div className="grid-wrapper">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelFirstName}
                                value={formData.firstname}
                                onChange={(value) => updateFormData({ firstname: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelLastName}
                                value={formData.lastname}
                                onChange={(value) => updateFormData({ lastname: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator, emailValidator]}
                                type="email"
                                label={props.text.labelEmail}
                                value={formData.email}
                                onChange={(value) => updateFormData({ email: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<PhoneFieldProps>
                                component={PhoneField}
                                validators={[requiredValidator]}
                                asyncValidators={[phoneNumberValidator]}
                                label={props.text.labelPhone}
                                value={formData.mobileNumber}
                                country={defaultCountryCode}
                                onChange={(value) => updatePhoneNumber(value)}
                            />
                        </Grid>
                        <div className="spacer" />
                        <Grid item xs={12} md={8}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelStreetAddress}
                                value={formData.street}
                                onChange={(value) => updateFormData({ street: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelApartment}
                                value={formData.apartmentNumber}
                                onChange={(value) => updateFormData({ apartmentNumber: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                label={props.text.labelState}
                                value={formData.region}
                                onChange={(value) => updateFormData({ region: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelCity}
                                value={formData.city}
                                onChange={(value) => updateFormData({ city: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={props.text.labelZip}
                                value={formData.zipCode}
                                onChange={(value) => updateFormData({ zipCode: value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <FormField<AutocompleteFieldProps>
                                component={AutocompleteField}
                                validators={[requiredValidator]}
                                label={props.text.labelCountry}
                                pending={state.pendingCountryOptions}
                                disabled={state.pendingCountryOptions}
                                options={state.countryOptions}
                                value={formData.country}
                                onChange={(value) => updateFormData({ country: value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormField<AutocompleteFieldProps>
                                component={AutocompleteField}
                                validators={[requiredValidator]}
                                label={props.text.labelLanguage}
                                options={state.catalogLanguageOptions}
                                value={formData.catalogLanguage}
                                onChange={(value) => updateFormData({ catalogLanguage: value })}
                            />
                        </Grid>
                    </Grid>
                </div>
                <Paragraph size="xs" className="required-field-note m-0 mt-1">*{props.text.labelRequired}</Paragraph>
                <Paragraph size="xs" className="form-data-consent mt-1">{props.text.labelConsent}</Paragraph>
                <Fade in={state.isConsentBoxVisible} unmountOnExit appear>
                    <CheckboxField
                        label={props.text.labelNewsletter}
                        checked={emailConsent}
                        onChange={(checked) => setEmailConsent(checked)}
                    />
                </Fade>
                <FormField<RecaptchaFieldProps>
                    component={RecaptchaField}
                    validators={[requiredValidator]}
                    value={recaptcha}
                    onChange={(value) => {setRecaptcha(value);}}
                />
                <div className="btn-container">
                    {props.onCancelClick && (
                        <Button
                            className={props.cancelButtonClassName}
                            type="button"
                            color="secondary"
                            onClick={props.onCancelClick}>
                            {props.text.buttonCancel}
                        </Button>
                    )}
                    <Button
                        className={props.submitButtonClassName}
                        type="button"
                        color="secondary"
                        onClick={() => requestCatalog()}
                        disabled={!form.isValid()}
                        pending={state.pending}>
                        {props.text.buttonSend}
                    </Button>
                </div>
            </div>
        </div>
    );
}
