import './Form.scss';

import React, { DetailedHTMLProps, InputHTMLAttributes, ReactElement, useState } from 'react';

import { Button } from '../../../../shared/components/formFields/Button';
import { useServer } from '../../../server/ServerProvider';
import { FormField } from '../../../../shared/components/formFields/FormField';
import { useForm } from '../../../../shared/components/formFields/FormProvider';
import { emailValidator, requiredValidator } from '../../../../shared/components/formFields/validators';
import { NewsletterContent } from './Newsletter';
import { sfmcEvent, gtmEvent } from '../../../../shared/helpers';
import { NewsletterRequestData } from '../../../server/NewsletterService';

interface Props {
    onSuccess: (email: string) => void;
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

    const server = useServer<NewsletterContent>();
    const form = useForm();
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
        const requestData = { email } as NewsletterRequestData;

        if (server.content.newsletterType !== 'standard') {
            requestData.newsletterType = server.content.newsletterType;
        }

        setPending(true);
        server.newsletterService.sendNewsletterRequest(requestData).then(
            () => {
                setPending(false);
                setEmail('');
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
            <h2>{server.content.text.formHeading}</h2>
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
                    placeholder={server.content.text.emailPlaceholder}
                    aria-label={server.content.text.emailPlaceholder}
                />
                <Button
                    type="submit"
                    className={server.getTrackingClassId('newsletter', 'submit')}
                    color="secondary"
                    size="medium"
                    pending={pending}
                    disabled={!form.isValid()}>
                    {server.content.text.formSubmit}
                </Button>
            </form>
        </div>
    );

}
