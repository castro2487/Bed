import './RequestCatalog4.scss';

import React, { useState, useRef } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';

import { useServer } from '../../../server/ServerProvider';
import { lightTheme } from '../../../../shared/muiTheme';
import { RequestCatalog as RequestCatalogForm, RequestCatalogTexts } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import { Confirmation, ConfirmText } from '../../../../shared/components/RequestCatalog/Confirmation';
import { Button } from '../../../../shared/components/formFields/Button';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';
import { scrollIntoView } from '../../../../shared/helpers';

export interface RequestCatalog4Content {
    text: ConfirmText & RequestCatalogTexts & {
        bannerHeading: string;
        bannerHeading2: string;
        bannerIntro: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function RequestCatalog4() {
    const { getTrackingClassId, content: { text } } = useServer<RequestCatalog4Content>();
    const bannerTextRef = useRef<HTMLDivElement>();
    const expandedViewRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    function expand() {
        scrollIntoView(expandedViewRef.current).then(() => {
            setExpanded(true);
        });
    }

    function collapse() {
        setExpanded(false);
        setTimeout(() => {
            bannerTextRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 600);
    }

    return (
        <div className="has-request-catalog-4">
            <div className={clsx('banner', { 'with-border': !expanded })}>
                <div className="text" ref={bannerTextRef}>
                    <header>
                        <Heading level={2} size="lg">{text.bannerHeading}<span>{text.bannerHeading2}</span></Heading>
                        <Paragraph>{text.bannerIntro}</Paragraph>
                    </header>
                    <div className="image"></div>
                    <Paragraph className="body">{text.bannerBody}</Paragraph>
                    <Button
                        className={getTrackingClassId('requestcatalog', 'cta')}
                        color="light"
                        onClick={() => {
                            expand();
                        }}>
                        {text.bannerButton}
                    </Button>
                </div>
            </div>
            <div className={clsx('expandable-view', { expanded })} ref={expandedViewRef}>
                <AnimatedSteps index={expanded ? 0 : -1}>
                    <AnimatedSteps index={formSubmitted ? 1 : 0}>
                        <ThemeProvider theme={lightTheme}>
                            <RequestCatalogForm
                                text={{
                                    formHeader: text.formHeader,
                                    formSubHeader: text.formSubHeader,
                                    buttonCancel: text.buttonCancel,
                                    buttonSend: text.buttonSend,
                                    labelFirstName: text.labelFirstName,
                                    labelLastName: text.labelLastName,
                                    labelEmail: text.labelEmail,
                                    labelPhone: text.labelPhone,
                                    labelStreetAddress: text.labelStreetAddress,
                                    labelApartment: text.labelApartment,
                                    labelState: text.labelState,
                                    labelCity: text.labelCity,
                                    labelCountry: text.labelCountry,
                                    labelZip: text.labelZip,
                                    labelLanguage: text.labelLanguage,
                                    labelNewsletter: text.labelNewsletter,
                                    labelRequired: text.labelRequired,
                                    labelConsent: text.labelConsent,
                                }}
                                cancelButtonClassName={getTrackingClassId('requestcatalog', 'cancel')}
                                submitButtonClassName={getTrackingClassId('requestcatalog', 'submit')}
                                onCancelClick={() => {
                                    collapse();
                                }}
                                onFormSuccess={() => {
                                    setFormSubmitted(true);
                                }}
                            />
                        </ThemeProvider>
                        <Confirmation
                            onCloseClick={() => {
                                collapse();
                                setFormSubmitted(false);
                            }}
                            text={{
                                confirmHeader: text.confirmHeader,
                                confirmBody: text.confirmBody,
                                buttonClose: text.buttonClose,
                            }}
                        />
                    </AnimatedSteps>
                </AnimatedSteps>
            </div>
        </div>
    );
}
