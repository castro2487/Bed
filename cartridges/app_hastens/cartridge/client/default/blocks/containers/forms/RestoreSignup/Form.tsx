import './Form.scss';

import React from 'react';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { ErrorBoundary } from '../../../../shared/components/ErrorBoundary';
import { FormContext, FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { Button } from '../../../../shared/components/formFields/Button';
import { RestoreSignupText } from './RestoreSignup';
import { TextField, TextFieldProps } from '../../../../shared/components/formFields/TextField';
import { emailValidator, requiredValidator } from '../../../../shared/components/formFields/validators';
import { StringHelper } from '../../../../shared/components/StringHelper';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../shared/components/formFields/RecaptchaField';
import { useServer } from '../../../server/ServerProvider';
import Dialog from '../../../../shared/components/dialogs/Dialog';

const initialFormData = {
    name: '',
    email: '',
    marketing: false,
};

interface Props {
    mailTo: string;
    setShowForm: () => void;
    showForm: boolean;
    text: RestoreSignupText;
}

export const Form: React.FC<Props> = ({ setShowForm, showForm, mailTo, text }) => {
    const { collaborationService } = useServer();
    const [reCaptcha, setReCaptcha] = React.useState('');
    const [processing, setProcessing] = React.useState(false);
    const [formData, setFormData] = React.useState(initialFormData);

    const submitForm = () => {
        setProcessing(true);

        const payload = {
            ...formData,
            mailTo,
            recaptcha: reCaptcha,
        };

        collaborationService.restoreCampaignRequest(payload).then((response: any) => {
            if (response) {
                setShowForm();
                resetForm();
            }
        }, () => {
            setProcessing(false);
        });
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setReCaptcha('');
        setProcessing(false);
    };

    return (
        <ErrorBoundary
            onError={setShowForm}>
            <Dialog
                size="sm"
                disableBackdropClick
                open={showForm}
                onClose={setShowForm}
                onExited={() => resetForm()}>
                <FormProvider>
                    <div className="has-restore-campaign-form">
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <FormField<TextFieldProps>
                                    label={text.fullName}
                                    component={TextField}
                                    validators={[requiredValidator]}
                                    value={formData.name}
                                    onChange={(name: string) => setFormData((prevFormData) => ({ ...prevFormData, name }))}
                                />
                            </Grid>

                            <Grid item xs={12} >
                                <FormField<TextFieldProps>
                                    label={text.email}
                                    component={TextField}
                                    validators={[requiredValidator, emailValidator]}
                                    value={formData.email}
                                    onChange={(email: string) => setFormData((prevFormData) => ({ ...prevFormData, email }))}
                                />
                            </Grid>
                            <Grid item xs={12} className="check-container">
                                <FormControlLabel
                                    className="checkBox"
                                    control={
                                        <Checkbox
                                            color="default"
                                            checked={formData.marketing}
                                            onChange={(event) => {
                                                event.persist();
                                                setFormData((prevFormData) => ({ ...prevFormData, marketing: event.target.checked }));
                                            }}
                                        />
                                    }
                                    labelPlacement="end"
                                    label={
                                        <StringHelper
                                            parameters={[text.heading]}>
                                            {text.agreement}
                                        </StringHelper>
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} className="center">
                                <FormField<RecaptchaFieldProps>
                                    component={RecaptchaField}
                                    validators={[requiredValidator]}
                                    value={reCaptcha}
                                    onChange={(value) => setReCaptcha(value)}
                                />
                            </Grid>

                            <Grid item xs={12} className="center">
                                <FormContext.Consumer>
                                    {(context) => (
                                        <Button
                                            color="secondary"
                                            disabled={!context.isValid() || processing || !formData.marketing}
                                            onClick={submitForm}>
                                            {text.sendRequest}
                                        </Button>
                                    )}
                                </FormContext.Consumer>
                            </Grid>
                        </Grid>
                    </div>
                </FormProvider>
            </Dialog>
        </ErrorBoundary>
    );
};
