import './BedConfigurator.scss';

import React, { ReactElement, useState } from 'react';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import { getButtonColor, lightTheme } from '../../../../shared/muiTheme';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { DialogContent } from './DialogContent/DialogContent';
import { Bed } from '../../../server/BedOrderService';
import { ErrorBoundary } from '../../../../shared/components/ErrorBoundary';
import { Theme, Image, useServer } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import Dialog from '../../../../shared/components/dialogs/Dialog';
import { Country } from '../../../server/LocationService';

export interface PartnerStoreContent {
    partnerEmail: string;
    customerNumber?: string;
    partnerSlug: string;
    countryCode: string;
}

interface BedConfiguratorContent {
    text: {
        bannerHeading: string;
        afterBannerHeading: string;
        bannerBody: string;
        bannerButton: string;
    };
    store?: PartnerStoreContent;
    theme: Theme;
    buttonColor: ButtonColor;
    image: Image;
}

export function BedConfigurator(): ReactElement {

    const server = useServer<BedConfiguratorContent>();
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [pendingDialog, setPendingDialog] = useState(false);
    const [beds, setBeds] = useState<Bed[]>([]);
    const [countryArray, setCountryArray] = useState<Country[]>([]);

    return (
        <ThemeProvider theme={lightTheme}>
            <Background image={server.content.image} theme={server.content.theme} className="has-bed-configurator">
                <div className="block-wrapper">
                    <div className="content-wrapper">
                        <header>
                            <Heading level={2} size="md" className="heading">{server.content.text.bannerHeading}</Heading>
                            {server.content.text.afterBannerHeading && (
                                <p>{server.content.text.afterBannerHeading}</p>
                            )}
                        </header>
                        {server.content.text.bannerBody && (
                            <Paragraph className="body">{server.content.text.bannerBody}</Paragraph>
                        )}
                        <div className="buttons">
                            <Button
                                className={server.getTrackingClassId('bedconf', 'cta')}
                                color={server.content.buttonColor || getButtonColor(server.content.theme)}
                                pending={pendingDialog}
                                onClick={() => {
                                    setPendingDialog(true);
                                    Promise.all([
                                        server.bedOrderService.getBeds(),
                                        server.locationService.getCountries(),
                                    ]).then(
                                        (response) => {
                                            setPendingDialog(false);
                                            setBeds(response[0]);
                                            setCountryArray(response[1]);
                                            setDialogIsOpen(true);
                                        },
                                        () => {
                                            setPendingDialog(false);
                                        },
                                    );
                                }}>
                                {server.content.text.bannerButton}
                            </Button>
                        </div>
                    </div>
                    <ErrorBoundary
                        onError={() => {
                            setDialogIsOpen(false);
                        }}>
                        <Dialog
                            size="lg"
                            hideCloseButton
                            disableBackdropClick
                            open={dialogIsOpen}
                            onClose={() => {
                                setDialogIsOpen(false);
                            }}>
                            <DialogContent
                                beds={beds}
                                countryArray={countryArray}
                                onClose={() => {
                                    setDialogIsOpen(false);
                                }}
                            />
                        </Dialog>
                    </ErrorBoundary>
                </div>
            </Background>
        </ThemeProvider>
    );

}
