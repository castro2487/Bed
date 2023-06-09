import React, { ReactElement, useState } from 'react';

import { FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { Form } from './Form';
import { Confirmation } from './Confirmation';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';
import { Theme, useServer } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';

export interface NewsletterContent {
    fallbackRequestCatalogUrl: string;
    newsletterType: 'standard' | 'supreme-x-hastens';
    theme: Theme;
    text: {
        formHeading: string;
        emailPlaceholder: string;
        formSubmit: string;
        confirmationHeading: string;
        confirmationMessage: string;
        getACatalog: string;
        getACatalogLinkText: string;
    };
}

export function Newsletter(): ReactElement {

    const server = useServer<NewsletterContent>();
    const [submittedEmail, setSubmittedEmail] = useState(null);

    return (
        <Background theme={server.content.theme}>
            <AnimatedSteps index={submittedEmail === null ? 0 : 1}>
                <FormProvider>
                    <Form
                        onSuccess={(email) => {
                            setSubmittedEmail(email);
                            setTimeout(() => {
                                setSubmittedEmail(null);
                            }, 15 * 1000);
                        }}
                    />
                </FormProvider>
                <Confirmation email={submittedEmail} />
            </AnimatedSteps>
        </Background>
    );

}
