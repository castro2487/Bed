import './Form.scss';

import React, { DetailedHTMLProps, InputHTMLAttributes, ReactElement, useState } from 'react';

import { Button } from '../../../../shared/components/formFields/Button';
import { useServer } from '../../../server/ServerProvider';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { useForm } from '../../../../shared/components/formFields/FormProvider';
import { emailValidator, requiredValidator } from '../../../../shared/components/formFields/validators';
import { sfmcEvent, gtmEvent, __ } from '../../../../shared/helpers';
import { NewsletterRequestData } from '../../../server/NewsletterService';

interface Props {
    onSuccess: (email: string) => void;
    heading: string;
}

const Input = (props: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => (
    <input
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        aria-label={props['aria-label']}
    />
);

export function Form(props: Props): ReactElement {

    const server = useServer();
    const form = useForm();
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        const requestData = { email } as NewsletterRequestData;

        setPending(true);
        server.newsletterService.sendNewsletterRequest(requestData).then(
            () => {
                setPending(false);
                props.onSuccess(email);
                gtmEvent('signUpForNewsLetter');
                sfmcEvent('newsletterSubscriptionEndEvent');
            },
            () => {
                setPending(false);
            },
        );
    }

    return (
        <div className="has-newsletter-form">
            <h2>{props.heading}</h2>
            <form className="form-wrapper" onSubmit={handleSubmit}>
                <FormField<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>
                    component={Input}
                    validators={[requiredValidator, emailValidator]}
                    value={email}
                    onChange={(event) => {
                        if (event.target.value.length > 0 && !hasInteracted) {
                            sfmcEvent('newsletterSubscriptionStartEvent');
                            setHasInteracted(true);
                        }
                        setEmail(event.target.value);
                    }}
                    placeholder={__('newsletter.form.emailplaceholder')}
                    aria-label={__('newsletter.form.emailplaceholder')}
                />
                <Button
                    type="submit"
                    className={server.getTrackingClassId('newsletter', 'submit')}
                    color="secondary"
                    size="medium"
                    pending={pending}
                    disabled={!form.isValid()}>
                    {__('newsletter.form.submit')}
                </Button>
            </form>
        </div>
    );

}
