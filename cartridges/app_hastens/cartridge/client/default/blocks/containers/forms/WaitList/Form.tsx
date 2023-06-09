import './Form.scss';

import React, { useState, useEffect } from 'react';
import { validate as validateEmail } from 'email-validator';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Fade from '@material-ui/core/Fade';

import { Button } from '../../../../shared/components/formFields/Button';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { useForm } from '../../../../shared/components/formFields/FormProvider';
import { emailValidator, phoneNumberValidator, requiredValidator } from '../../../../shared/components/formFields/validators';
import { TextField, TextFieldProps } from '../../../../shared/components/formFields/TextField';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../shared/components/formFields/RecaptchaField';
import { AutocompleteField, AutocompleteFieldProps } from '../../../../shared/components/formFields/AutocompleteField';
import { PhoneField, PhoneFieldProps } from '../../../../shared/components/formFields/PhoneField';
import { useServer } from '../../../server/ServerProvider';
import { CatalogRequestData } from '../../../server/CatalogService';
import { WaitListContent } from './WaitList';
import { Heading } from '../../../../shared/components/typography/Heading';
import { gtmEvent, parsePhoneNumberFromString } from '../../../../shared/helpers';

interface Props {
    onFormSubmitted: () => void;
    defaultCountryCode: string;
    position: {
        method: string;
        longitude: number;
        latitude: number;
    };
}

export function Form(props: Props) {

    const server = useServer<WaitListContent>();
    const form = useForm();

    const [appState, setState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        streetAddress: '',
        apartmentNo: '',
        state: '',
        city: '',
        pending: false,
        postalCode: '',
        isValidPhoneNumber: false,
        isMarketingConsentGiven: false,
        isConsentBoxVisible: false,
        country: null,
        recaptchaValue: '',
        phone: {
            countryCallingCode: null,
            phoneNumber: null,
        },
        position: {
            method: 'geolocation',
            longitude: null,
            latitude: null,
        },
        edited: false,
        catalogLanguage: null,
        catalogLanguageOptions: [],
        countryOptions: [],
        pendingCountryOptions: false,
    });

    function updateState(nextState) {
        setState((prevState) => ({
            ...prevState,
            ...nextState,
        }));
    }

    useEffect(() => {
        updateState({
            pendingCountryOptions: true,
            catalogLanguageOptions: server.catalogService.getCatalogLanguages(),
        });
        server.locationService.getCountries().then(
            (countries) => {
                if (countries) {
                    const allowedCountries = countries.map((country) => country.code);
                    updateState({
                        countryOptions: countries.map((country) => ({ value: country.code, label: country.name })),
                        pendingCountryOptions: false,
                        country: server.getAllowedCountry(allowedCountries),
                    });
                }
            },
            () => {
                updateState({ pendingCountryOptions: false });
            },
        );
    }, []);

    useEffect(() => {
        const updatedState: any = {};

        if (!Boolean(appState.position.latitude)) {
            updatedState.position = props.position;
        }

        updateState(updatedState);

    }, [props.position]);

    useEffect(() => {
        if (validateEmail(appState.email)) {
            getEmailMarketingConsent(appState.email);
        }
    }, [appState.email]);

    function requestCatalog() {
        updateState({ pending: true });
        const requestObject = makeRequestObject();
        server.catalogService.sendCatalogRequest(requestObject).then((response: any) => {
            if (response) {
                props.onFormSubmitted();
                gtmEvent('GrandVividusjointhewaitlist');
            }
        }, () => {
            updateState({ pending: false });
        });
    }

    function makeRequestObject(): CatalogRequestData {
        const {
            firstName, lastName, email, phone, streetAddress, apartmentNo,
            state, city, postalCode, country, isMarketingConsentGiven,
            recaptchaValue, position, catalogLanguage,
        } = appState;

        const requestData: CatalogRequestData = {
            firstname: firstName,
            lastname: lastName,
            email,
            phonePrefix: phone.countryCallingCode,
            phone: phone.phoneNumber,
            recaptcha: recaptchaValue,
            street: streetAddress,
            apartmentNumber: apartmentNo,
            region: state,
            city,
            zipCode: postalCode,
            country,
            consent: isMarketingConsentGiven,
            formId: 'catreq1',
            location: 10902234,
            position,
            catalogLanguage,
            origin: 'grand-vividus-main',
            originUrl: location.protocol + '//' + location.host + location.pathname,
        };

        // Make sure that either both phonePrefix and phone are specified, or none
        requestData.phonePrefix = requestData.phonePrefix && requestData.phone ? requestData.phonePrefix : '';
        requestData.phone = requestData.phonePrefix && requestData.phone ? requestData.phone : '';

        return requestData;
    }

    function getEmailMarketingConsent(email) {
        server.catalogService.checkEmailMarketingConsent({ email }).then((consent) => {
            updateState({
                isMarketingConsentGiven: Boolean(consent.isMarketingConsentGiven),
                isConsentBoxVisible: !Boolean(consent.isMarketingConsentGiven),
            });
        });
    }

    function updatePhoneNumber(phoneNumber) {
        parsePhoneNumberFromString(phoneNumber).then((validatedNumber) => {
            const updatedState: any = {
                mobileNumber: phoneNumber,
                isValidPhoneNumber: false,
                phone: {
                    countryCallingCode: null,
                    phoneNumber: null,
                },
            };

            if (validatedNumber) {
                updatedState.isValidPhoneNumber = validatedNumber.isValid();

                updatedState.phone = {
                    countryCallingCode: validatedNumber.isValid() ? validatedNumber.countryCallingCode : null,
                    phoneNumber: validatedNumber.isValid() ? validatedNumber.nationalNumber : null,
                };
            }

            updateState(updatedState);
        });
    }

    return (
        <div className="has-wait-list-form">
            <div className="content-wrapper">
                <Heading level={2} className="heading">{server.content.text.formHeading}</Heading>
                <p className="intro">{server.content.text.formIntro}</p>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelFirstName}
                            value={appState.firstName}
                            onChange={(value) => updateState({ firstName: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelLastName}
                            value={appState.lastName}
                            onChange={(value) => updateState({ lastName: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator, emailValidator]}
                            type="email"
                            label={server.content.text.labelEmail}
                            value={appState.email}
                            onChange={(value) => updateState({ email: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormField<PhoneFieldProps>
                            component={PhoneField}
                            validators={[requiredValidator]}
                            asyncValidators={[phoneNumberValidator]}
                            label={server.content.text.labelPhone}
                            value={appState.mobileNumber}
                            country={props.defaultCountryCode}
                            onChange={(value) => updatePhoneNumber(value)}
                        />
                    </Grid>
                    <div className="spacer" />
                    <Grid item xs={12} md={8}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelStreetAddress}
                            value={appState.streetAddress}
                            onChange={(value) => updateState({ streetAddress: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelApartment}
                            value={appState.apartmentNo}
                            onChange={(value) => updateState({ apartmentNo: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            label={server.content.text.labelState}
                            value={appState.state}
                            onChange={(value) => updateState({ state: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelCity}
                            value={appState.city}
                            onChange={(value) => updateState({ city: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormField<TextFieldProps>
                            component={TextField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelZip}
                            value={appState.postalCode}
                            onChange={(value) => updateState({ postalCode: value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormField<AutocompleteFieldProps>
                            component={AutocompleteField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelCountry}
                            pending={appState.pendingCountryOptions}
                            disabled={appState.pendingCountryOptions}
                            options={appState.countryOptions}
                            value={appState.country}
                            onChange={(value) => updateState({ country: value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormField<AutocompleteFieldProps>
                            component={AutocompleteField}
                            validators={[requiredValidator]}
                            label={server.content.text.labelLanguage}
                            options={appState.catalogLanguageOptions}
                            value={appState.catalogLanguage}
                            onChange={(value) => updateState({ catalogLanguage: value })}
                        />
                    </Grid>
                </Grid>
                <p className="required-field-note">*{server.content.text.labelRequired}</p>
                <p className="form-data-consent">{server.content.text.labelConsent}</p>
                <Fade in={appState.isConsentBoxVisible} unmountOnExit appear>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="default"
                                checked={appState.isMarketingConsentGiven}
                                onChange={(event) => updateState({ isMarketingConsentGiven: event.target.checked })}
                            />
                        }
                        labelPlacement="end"
                        label={server.content.text.labelNewsletter}
                    />
                </Fade>
                <FormField<RecaptchaFieldProps>
                    component={RecaptchaField}
                    validators={[requiredValidator]}
                    value={appState.recaptchaValue}
                    onChange={(value) => {updateState({ recaptchaValue: value });}}
                />
                <div className="btn-container">
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => requestCatalog()}
                        disabled={!form.isValid()}
                        pending={appState.pending}>
                        {server.content.text.buttonSend}
                    </Button>
                </div>
            </div>
        </div>
    );
}
