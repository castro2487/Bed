import './RequestCatalog.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { Form } from './Form';
import { FormProvider } from '../formFields/FormProvider';
import { HeadingSize } from '../typography/Heading';

export interface RequestCatalogTexts {
    cta?: string;
    formHeader: string;
    formSubHeader?: string;
    buttonCancel: string;
    buttonSend: string;
    labelFirstName: string;
    labelLastName: string;
    labelEmail: string;
    labelPhone: string;
    labelStreetAddress: string;
    labelApartment: string;
    labelState: string;
    labelCity: string;
    labelCountry: string;
    labelZip: string;
    labelLanguage: string;
    labelNewsletter: string;
    labelRequired: string;
    labelConsent: string;
}

interface Props {
    text: RequestCatalogTexts;
    cancelButtonClassName?: string;
    submitButtonClassName?: string;
    onCancelClick: () => void;
    onFormSuccess?: () => void;
    headingSize?: HeadingSize;
    className?: string;
    origin?: string;
}

export const baseClass = 'has-request-catalog';

export function RequestCatalog({ onCancelClick, onFormSuccess, cancelButtonClassName, submitButtonClassName, text, headingSize, className, origin }: Props): ReactElement {

    return (
        <FormProvider>
            <div className={clsx(baseClass, className)}>
                <Form
                    text={text}
                    headingSize={headingSize}
                    cancelButtonClassName={cancelButtonClassName}
                    submitButtonClassName={submitButtonClassName}
                    onCancelClick={onCancelClick}
                    onFormSubmitted={onFormSuccess}
                    origin={origin}
                />
            </div>
        </FormProvider>
    );

}
