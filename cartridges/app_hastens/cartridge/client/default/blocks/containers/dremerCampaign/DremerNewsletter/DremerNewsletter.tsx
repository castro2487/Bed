import React, { ReactElement, useState } from 'react';

import { FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { Form } from './Form';
import { Confirmation } from './Confirmation';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';
import { Background } from '../../../../shared/components/Background';

export interface Props {
    fallbackRequestCatalogUrl: string;
    formHeading: string;
    onClose: () => void;
}

/**
 * This component is an altered duplicate of the Newsletter component
 * @todo Create a shared Newsletter component
 */
export default function Newsletter(props: Props): ReactElement {
    const [submittedEmail, setSubmittedEmail] = useState(null);

    return (
        <Background theme="black-1">
            <AnimatedSteps index={submittedEmail === null ? 0 : 1}>
                <FormProvider>
                    <Form
                        heading={props.formHeading}
                        onSuccess={(email) => {
                            setSubmittedEmail(email);
                            setTimeout(() => {
                                props.onClose();
                            }, 15 * 1000);
                        }}
                    />
                </FormProvider>
                <Confirmation
                    email={submittedEmail}
                    fallbackRequestCatalogUrl={props.fallbackRequestCatalogUrl}
                />
            </AnimatedSteps>
        </Background>
    );

}
