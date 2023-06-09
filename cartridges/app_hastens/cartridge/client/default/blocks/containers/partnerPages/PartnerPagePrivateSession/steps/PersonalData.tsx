import './PersonalData.scss';

import React, { useState } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { useServer } from '../../../../server/ServerProvider';
import { ServerContent } from './../PartnerPagePrivateSession';
import { Button } from '../../../../../shared/components/formFields/Button';
import { lightTheme } from '../../../../../shared/muiTheme';
import { FormField } from '../../../../../shared/components/formFields/FormField';
import { PhoneField, PhoneFieldProps } from '../../../../../shared/components/formFields/PhoneField';
import { TextField, TextFieldProps } from '../../../../../shared/components/formFields/TextField';
import { emailValidator, phoneNumberValidator, requiredValidator } from '../../../../../shared/components/formFields/validators';
import { Heading } from '../../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../../shared/components/formFields/RecaptchaField';
import { parsePhoneNumberFromString } from '../../../../../shared/helpers';
import { useForm } from '../../../../../shared/components/formFields/FormProvider';
import { PrivateSessionRequestData } from '../../../../server/PrivateSessionService';

interface Props {
    formData: PrivateSessionRequestData;
    onChangeFormData: (formData) => void;
    onBackClick: () => void;
    onSubmitComplete: () => void;
    phoneInput: string;
    onChangePhone: (value) => void;
    countryInput: string;
}

export default function PersonalData(props: Props) {

    const { content, privateSessionService } = useServer<ServerContent>();
    const form = useForm();
    const [pendingSubmit, setPendingSubmit] = useState(false);

    return (
        <ThemeProvider theme={lightTheme}>
            <div className="has-partner-page_private-session_personal-data">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{content.texts.formHeading}</Heading>
                    <Paragraph className="body">{content.texts.formBody}</Paragraph>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormField<TextFieldProps>
                                label={content.texts.labelFirstName}
                                component={TextField}
                                validators={[requiredValidator]}
                                value={props.formData.firstName}
                                onChange={(firstName) => {
                                    props.onChangeFormData({ firstName });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormField<TextFieldProps>
                                label={content.texts.labelLastName}
                                component={TextField}
                                validators={[requiredValidator]}
                                value={props.formData.lastName}
                                onChange={(lastName) => {
                                    props.onChangeFormData({ lastName });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormField<TextFieldProps>
                                label={content.texts.labelEmail}
                                component={TextField}
                                validators={[requiredValidator, emailValidator]}
                                value={props.formData.email}
                                onChange={(email) => {
                                    props.onChangeFormData({ email });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormField<PhoneFieldProps>
                                label={content.texts.labelPhone}
                                component={PhoneField}
                                country={props.countryInput}
                                validators={[requiredValidator]}
                                asyncValidators={[phoneNumberValidator]}
                                value={props.phoneInput}
                                onChange={(value) => {
                                    props.onChangePhone(value);
                                    parsePhoneNumberFromString(value).then((validatedNumber) => {
                                        props.onChangeFormData({
                                            phonePrefix: validatedNumber?.isValid() ? validatedNumber.countryCallingCode : undefined,
                                            phone: validatedNumber?.isValid() ? validatedNumber.nationalNumber : undefined,
                                        });
                                    });
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Paragraph size="xs" className="required-text">*{content.texts.labelRequired}</Paragraph>
                    <Paragraph size="xs" className="consent-text">{content.texts.labelConsent}</Paragraph>
                    <FormField<RecaptchaFieldProps>
                        component={RecaptchaField}
                        validators={[requiredValidator]}
                        value={props.formData.recaptcha}
                        onChange={(recaptcha) => {
                            props.onChangeFormData({ recaptcha });
                        }}
                    />
                    <div className="button-container">
                        <Button
                            color="secondary"
                            onClick={props.onBackClick}>
                            {content.texts.buttonCancel}
                        </Button>
                        <Button
                            disabled={!form.isValid()}
                            pending={pendingSubmit}
                            color="secondary"
                            onClick={() => {
                                setPendingSubmit(true);
                                privateSessionService.requestPrivateSession(props.formData).then(
                                    () => {
                                        setPendingSubmit(false);
                                        props.onSubmitComplete();
                                    },
                                    () => {
                                        setPendingSubmit(false);
                                    },
                                );
                            }}>
                            {content.texts.buttonSendRequest}
                        </Button>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );

}
