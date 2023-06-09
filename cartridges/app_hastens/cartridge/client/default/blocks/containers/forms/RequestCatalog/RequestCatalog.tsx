import React, { useState, ReactElement } from 'react';
import { createStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import { Image, Theme, useServer } from '../../../server/ServerProvider';
import { lightTheme } from '../../../../shared/muiTheme';
import { RequestCatalog as RequestCatalogForm, RequestCatalogTexts } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import { Confirmation, ConfirmText } from '../../../../shared/components/RequestCatalog/Confirmation';
import { Banner, BannerTexts } from '../../../../shared/components/RequestCatalog/Banner';
import { ButtonColor } from '../../../../shared/components/formFields/Button';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';

export interface RequestCatalogContent {
    bannerImage: Image;
    hideBanner: boolean;
    text: ConfirmText & RequestCatalogTexts & BannerTexts;
    bannerTheme: Theme;
    bannerButtonColor: ButtonColor;
}

const useStyles = makeStyles(() => createStyles({
    root: {
        background: '#eee',
        color: '#000',
    },
}));

export const requestCatalogBlockId = 'request-catalog';

export function RequestCatalog(): ReactElement {
    const classes = useStyles();
    const { getTrackingClassId, content: { text, bannerImage, bannerTheme, bannerButtonColor, hideBanner } } = useServer<RequestCatalogContent>();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <ThemeProvider theme={lightTheme}>
            <div className={classes.root} id={requestCatalogBlockId}>
                <AnimatedSteps index={activeIndex}>
                    {!hideBanner && (
                        <Banner
                            image={bannerImage}
                            theme={bannerTheme}
                            buttonColor={bannerButtonColor}
                            text={{
                                bannerHeading: text.bannerHeading,
                                bannerBody: text.bannerBody,
                                bannerButton: text.bannerButton,
                            }}
                            buttonClassName={getTrackingClassId('requestcatalog', 'cta')}
                            onButtonClick={() => {
                                setActiveIndex(1);
                            }}
                        />
                    )}
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
                        onCancelClick={hideBanner ? undefined : () => {
                            setActiveIndex(0);
                        }}
                        onFormSuccess={() => {
                            setActiveIndex(hideBanner ? 1 : 2);
                        }}
                    />
                    <Confirmation
                        onCloseClick={() => {
                            setActiveIndex(0);
                        }}
                        text={{
                            confirmHeader: text.confirmHeader,
                            confirmBody: text.confirmBody,
                            buttonClose: text.buttonClose,
                        }}
                    />
                </AnimatedSteps>
            </div>
        </ThemeProvider>
    );
}
