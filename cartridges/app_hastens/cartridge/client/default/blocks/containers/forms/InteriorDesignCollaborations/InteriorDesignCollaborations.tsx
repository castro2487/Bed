import './InteriorDesignCollaborations.scss';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import { ThemeProvider } from '@material-ui/core/styles';

import { FormField } from '../../../../shared/components/formFields/FormField';
import { FormProvider, useForm } from '../../../../shared/components/formFields/FormProvider';
import { TextField, TextFieldProps } from '../../../../shared/components/formFields/TextField';
import { emailValidator, phoneNumberValidator, requiredValidator } from '../../../../shared/components/formFields/validators';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../shared/components/formFields/RecaptchaField';
import { PhoneField, PhoneFieldProps } from '../../../../shared/components/formFields/PhoneField';
import { lightTheme } from '../../../../shared/muiTheme';
import { Button } from '../../../../shared/components/formFields/Button';
import { useServer } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { AutocompleteField, AutocompleteFieldProps } from '../../../../shared/components/formFields/AutocompleteField';
import { CollaborationRequestData } from '../../../server/CollaborationService';
import { RichText } from '../../../../shared/components/typography/RichText';
import { Country, Store } from '../../../server/LocationService';
import { shouldScrollIntoView } from '../../../../shared/helpers';

interface InteriorDesignCollaborationsContent {
    text: {
        heading: string;
        body: string;
        buttonSubmit: string;
        labelFirstName: string;
        labelLastName: string;
        labelCompanyName: string;
        labelCompanyRegNumber: string;
        labelStreetAddress: string;
        labelZip: string;
        labelCity: string;
        labelCountry: string;
        labelPhone: string;
        labelMobilePhone: string;
        labelEmail: string;
        labelWebsite: string;
        labelStore: string;
        mainClients: string;
        private: string;
        commercial: string;
        emailConsent: string;
        thankyouMessage: string;
    };
}

export function InteriorDesignCollaborations() {
    return (
        <ThemeProvider theme={lightTheme}>
            <FormProvider><Form /></FormProvider>
        </ThemeProvider>
    );
}

function Form() {

    const server = useServer<InteriorDesignCollaborationsContent>();
    const form = useForm();
    const rootRef = useRef<HTMLDivElement>();
    const [formData, setFormData] = useState<CollaborationRequestData>({} as CollaborationRequestData);
    const [pending, setPending] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [pendingCountries, setPendingCountries] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [pendingStores, setPendingStores] = useState(false);

    const defaultPhoneCountry = (() => {
        if (countries.length) {
            return server.getAllowedCountry(countries.map((country) => country.code));
        }
    })();

    useEffect(() => {
        setPendingCountries(true);
        setPendingStores(true);
        server.locationService.getCountries().then(
            (response) => {
                setCountries(response);
                setPendingCountries(false);
            },
            () => {
                setPendingCountries(false);
            },
        );
        server.locationService.getStores().then(
            (response) => {
                setStores(response);
                setPendingStores(false);
            },
            () => {
                setPendingStores(false);
            },
        );
    }, []);

    function updateForm(field, value) {
        setFormData((state) => ({
            ...state,
            [field]: value,
        }));
    }

    function sendForm() {
        setPending(true);
        server.collaborationService.sendCollaborationRequest(formData).then(() => {
            setShowConfirmation(true);
            setPending(false);
            if (shouldScrollIntoView(rootRef.current)) {
                rootRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        }, () => {
            setPending(false);
        });
    }

    function renderConfirmation() {
        return (
            <Paragraph size="lg" className="thankyou-message">{server.content.text.thankyouMessage}</Paragraph>
        );
    }

    function renderForm() {
        return (
            <Fragment>
                {server.content.text.heading && (
                    <Heading className="heading" level={2} size="sm">{server.content.text.heading}</Heading>
                )}
                {server.content.text.body && (
                    <RichText className="body">{server.content.text.body}</RichText>
                )}
                <div className="form-wrapper">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelFirstName}
                                value={formData.firstname}
                                onChange={(value) => {updateForm('firstname', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelLastName}
                                value={formData.lastname}
                                onChange={(value) => {updateForm('lastname', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelCompanyName}
                                value={formData.company}
                                onChange={(value) => {updateForm('company', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelCompanyRegNumber}
                                value={formData.companynr}
                                onChange={(value) => {updateForm('companynr', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelStreetAddress}
                                value={formData.address}
                                onChange={(value) => {updateForm('address', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelZip}
                                value={formData.zipcode}
                                onChange={(value) => {updateForm('zipcode', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelCity}
                                value={formData.city}
                                onChange={(value) => {updateForm('city', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<AutocompleteFieldProps>
                                component={AutocompleteField}
                                validators={[requiredValidator]}
                                label={server.content.text.labelCountry}
                                pending={pendingCountries}
                                disabled={pendingCountries}
                                options={countries.map((country) => ({
                                    label: country.name,
                                    value: country.code,
                                }))}
                                value={formData.country}
                                onChange={(value) => {updateForm('country', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<PhoneFieldProps>
                                component={PhoneField}
                                asyncValidators={[phoneNumberValidator]}
                                country={defaultPhoneCountry}
                                label={server.content.text.labelPhone}
                                value={formData.telephone}
                                onChange={(value) => {updateForm('telephone', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<PhoneFieldProps>
                                component={PhoneField}
                                asyncValidators={[phoneNumberValidator]}
                                country={defaultPhoneCountry}
                                label={server.content.text.labelMobilePhone}
                                value={formData.mobile}
                                onChange={(value) => {updateForm('mobile', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                validators={[requiredValidator, emailValidator]}
                                label={server.content.text.labelEmail}
                                value={formData.email}
                                onChange={(value) => {updateForm('email', value);}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormField<TextFieldProps>
                                component={TextField}
                                label={server.content.text.labelWebsite}
                                value={formData.website}
                                onChange={(value) => {updateForm('website', value);}}
                            />
                        </Grid>
                    </Grid>
                    <div className="main-clients">
                        <Heading level={3} size="xs" className="main-clients-heading">{server.content.text.mainClients}</Heading>
                        <FormGroup aria-label="position" row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.privateClients}
                                        onChange={(event) => updateForm('privateClients', event.target.checked)}
                                        value={formData.privateClients}
                                    />
                                }
                                labelPlacement="end"
                                label={server.content.text.private}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.commercialClients}
                                        onChange={(event) => updateForm('commercialClients', event.target.checked)}
                                        value={formData.commercialClients}
                                    />
                                }
                                labelPlacement="end"
                                label={server.content.text.commercial}
                            />
                        </FormGroup>
                    </div>
                    <FormField<AutocompleteFieldProps>
                        component={AutocompleteField}
                        validators={[requiredValidator]}
                        label={server.content.text.labelStore}
                        pending={pendingStores}
                        disabled={pendingStores}
                        options={stores.map((store) => ({
                            label: store.name,
                            value: store.id,
                        }))}
                        value={formData.location}
                        onChange={(value) => {updateForm('location', value);}}
                    />
                    <div className="agree-to-emails">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.agreeToEmails}
                                    onChange={(event) => updateForm('agreeToEmails', event.target.checked)}
                                    value={formData.agreeToEmails}
                                />
                            }
                            labelPlacement="end"
                            label={server.content.text.emailConsent}
                        />
                    </div>
                    <FormField<RecaptchaFieldProps>
                        component={RecaptchaField}
                        validators={[requiredValidator]}
                        value={formData.recaptcha}
                        onChange={(recaptcha) => updateForm('recaptcha', recaptcha)}
                    />
                    <div className="button-wrapper">
                        <Button
                            disabled={!form.isValid()}
                            pending={pending}
                            onClick={() => {
                                sendForm();
                            }}>
                            {server.content.text.buttonSubmit}
                        </Button>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Background theme="grey-3">
            <div className="has-interior-design-collaborations" ref={rootRef}>
                {showConfirmation ? renderConfirmation() : renderForm()}
            </div>
        </Background>
    );
}
