import './WinterCampaignRequestCatalog.scss';

import React, { ReactElement, useRef, useState } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import clsx from 'clsx';

import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../shared/components/AnimatedSteps';
import { lightTheme } from '../../../shared/muiTheme';
import { Confirmation, ConfirmText } from '../../../shared/components/RequestCatalog/Confirmation';
import { RequestCatalog as RequestCatalogForm, RequestCatalogTexts } from '../../../shared/components/RequestCatalog/RequestCatalog';
import { scrollIntoView } from '../../../shared/helpers';
import { useServer } from '../../server/ServerProvider';

export interface WinterCampaignRequestCatalogContent {
    text: ConfirmText & RequestCatalogTexts & {
        bannerHeading: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function WinterCampaignRequestCatalog(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<WinterCampaignRequestCatalogContent>();
    const rootRef = useRef<HTMLDivElement>();
    const expandableViewRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    function expand() {
        scrollIntoView(expandableViewRef.current).then(() => {
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
        <div className="has-winter-campaign-request-catalog" ref={rootRef}>
            <Background theme="white-1" className="banner">
                <div className="image"></div>
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{text.bannerHeading}</Heading>
                    <Paragraph className="body">{text.bannerBody}</Paragraph>
                    <Button
                        className={clsx('link', getTrackingClassId('requestcatalog', 'cta'))}
                        color="dark"
                        onClick={() => {
                            expand();
                        }}>
                        {text.bannerButton}
                    </Button>
                </div>
            </Background>
            <div className="expandable-view" ref={expandableViewRef}>
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
