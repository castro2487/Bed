import './Form.scss';

import React, { useState, useEffect } from 'react';
import { validate as validateEmail } from 'email-validator';

import { Button } from '../../../../shared/components/formFields/Button';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { TextField, TextFieldProps } from '../../../../shared/components/formFields/TextField';
import { useServer } from '../../../server/ServerProvider';
import { getButtonColor } from '../../../../shared/muiTheme';
import { sfmcEvent } from '../../../../shared/helpers';
import { VideoSubscriptionContent } from './VideoSubscription';

interface Props {
    text: any;
    onFormSubmitted: () => void;
}

export function Form(props: Props) {

    const { newsletterService, content } = useServer<VideoSubscriptionContent>();

    const [email, setEmail] = useState('');
    const [hasInteracted, setHasInteracted] = useState(false);
    const [appState, setState] = useState({
        emailValid: false,
        pending: false,
    });

    function updateState(updatedState) {
        setState({
            ...appState,
            ...updatedState,
        });
    }

    useEffect(() => {
        if (validateEmail(email)) {
            updateState({ emailValid: true });
        } else {
            updateState({ emailValid: false });
        }
        if (email.length > 0 && !hasInteracted) {
            sfmcEvent('videoSubscriptionStartEvent');
            setHasInteracted(true);
        }
    }, [email]);

    function newsletterRequest() {
        updateState({ pending: true });
        newsletterService.sendNewsletterRequest({ email, sleepCampaign: true, videoSubscription: true, customerNumber: '185200' }).then((response: any) => {
            if (response) {
                props.onFormSubmitted();
                sfmcEvent('videoSubscriptionEndEvent');
            }
        }, () => {
            updateState({ pending: false });
        });
    }

    return (
        <div className="has-video-subscription-form">
            <FormField<TextFieldProps>
                component={TextField}
                type="email"
                label={props.text.labelEmail}
                value={email}
                onChange={(value) => setEmail(value)}
                className="email-input"
            />
            <Button
                type="button"
                size="medium"
                color={getButtonColor(content.theme)}
                onClick={() => newsletterRequest()}
                disabled={!appState.emailValid}
                pending={appState.pending}>
                {props.text.buttonSubmit}
            </Button>
        </div>
    );
}
