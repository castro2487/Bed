import './RequestCatalog3.scss';

import React, { useState, useRef } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';

import { useServer } from '../../../server/ServerProvider';
import { lightTheme } from '../../../../shared/muiTheme';
import { RequestCatalog as RequestCatalogForm, RequestCatalogTexts } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import { Confirmation, ConfirmText } from '../../../../shared/components/RequestCatalog/Confirmation';
import { Button } from '../../../../shared/components/formFields/Button';
import { addSups, scrollIntoView } from '../../../../shared/helpers';
import { Heading } from '../../../../shared/components/typography/Heading';
import { TextColumns } from '../../../../shared/components/TextColumns';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';

export interface RequestCatalog3Content {
    text: ConfirmText & RequestCatalogTexts & {
        bannerHeading: string;
        afterBannerHeading: string;
        bannerBody: string;
        bannerButton: string;
    };
    columns: 1 | 2;
}

export function RequestCatalog3() {
    const { getTrackingClassId, content: { text, columns } } = useServer<RequestCatalog3Content>();
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
        <div className="has-request-catalog-3">
            <div className="banner">
                <div className="top-image"></div>
                <div className="text" ref={bannerTextRef}>
                    <header>
                        <Heading level={2} size="md">{addSups(text.bannerHeading)}</Heading>
                        <p>{text.afterBannerHeading}</p>
                    </header>
                    <TextColumns text={{ body: text.bannerBody }} columns={columns} />
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
