import './PriceIncreaseCampaignRequestCatalog.scss';

import React, { ReactElement, useRef, useState } from 'react';
import { ThemeProvider } from '@material-ui/styles';

import AnimatedSteps from '../../../shared/components/AnimatedSteps';
import { lightTheme } from '../../../shared/muiTheme';
import { Confirmation, ConfirmText } from '../../../shared/components/RequestCatalog/Confirmation';
import { RequestCatalog as RequestCatalogForm, RequestCatalogTexts } from '../../../shared/components/RequestCatalog/RequestCatalog';
import { scrollIntoView } from '../../../shared/helpers';
import { useServer } from '../../server/ServerProvider';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button } from '../../../shared/components/formFields/Button';

export interface PriceIncreaseCampaignRequestCatalogContent {
    text: ConfirmText & RequestCatalogTexts & {
        bannerHeading: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function PriceIncreaseCampaignRequestCatalog(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<PriceIncreaseCampaignRequestCatalogContent>();
    const rootRef = useRef<HTMLDivElement>();
    const scrollTargetRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    function expand() {
        scrollIntoView(scrollTargetRef.current).then(() => {
            setExpanded(true);
        });
    }

    function collapse() {
        setExpanded(false);
        setTimeout(() => {
            rootRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 600);
    }

    return (
        <div className="has-price-increase-campaign__request-catalog" ref={rootRef}>
            <div className="banner">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{text.bannerHeading}</Heading>
                    <Paragraph>{text.bannerBody}</Paragraph>
                    <div className="button-wrapper">
                        <Button
                            className={getTrackingClassId('requestcatalog', 'cta')}
                            color="dark"
                            onClick={() => {
                                expand();
                            }}>
                            {text.bannerButton}
                        </Button>
                    </div>
                </div>
                <div className="scroll-target" ref={scrollTargetRef}></div>
            </div>
            <div className="expandable-view">
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
