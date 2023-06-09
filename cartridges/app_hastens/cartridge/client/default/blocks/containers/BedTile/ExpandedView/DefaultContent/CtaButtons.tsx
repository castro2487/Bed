import './CtaButtons.scss';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

import { Button } from '../../../../../shared/components/formFields/Button';
import { ErrorBoundary } from '../../../../../shared/components/ErrorBoundary';
import { useServer } from '../../../../server/ServerProvider';
import { BookBedTest } from '../../../../../shared/components/BookBedTest/BookBedTest';
import { RequestCatalog } from './dialogContent/RequestCatalog';
import { DialogContent as BedConfigurator } from '../../../forms/BedConfigurator/DialogContent/DialogContent';
import { Bed } from '../../../../server/BedOrderService';
import { Country } from '../../../../server/LocationService';
import { BedCode, BedTileContent } from '../../helpers';
import { lightTheme } from '../../../../../shared/muiTheme';
import Dialog from '../../../../../shared/components/dialogs/Dialog';

type ButtonKey = 'catalogRequest' | 'bookBedTest' | 'storeLocator' | 'bedConfigurator';

interface CtaButtonsProps {
    activeBed: BedCode;
    onOpenDialog: () => void;
    onCloseDialog: () => void;
}

export function CtaButtons({ activeBed, onOpenDialog, onCloseDialog }: CtaButtonsProps) {
    const {
        bedOrderService, locationService, shouldDisableBedConfigurator,
        content: { requestCatalog, bookBedTest, storeLocator, bedConfigurator },
    } = useServer<BedTileContent>();

    const [beds, setBeds] = useState<Bed[]>([]);
    const [pendingDialog, setPendingDialog] = useState(false);
    const [countryArray, setCountryArray] = useState<Country[]>([]);
    const [visibleComponent, setVisibleComponent] = useState<ButtonKey | null>(null);

    useEffect(() => {
        if (visibleComponent) {
            onOpenDialog();
        } else {
            onCloseDialog();
        }
    }, [visibleComponent]);

    function getComponentToDisplay() {
        switch (visibleComponent) {
            case 'catalogRequest':
                return <RequestCatalog onClose={() => {setVisibleComponent(null);}} />;
            case 'bookBedTest':
                return <BookBedTest text={bookBedTest.text} onCloseClick={() => {setVisibleComponent(null);}} />;
            case 'bedConfigurator':
                const selectedBed = Boolean(activeBed) ? beds.filter((bed) => bed?.code === activeBed) : beds;
                return <BedConfigurator
                    beds={selectedBed}
                    selectedBed={activeBed}
                    alwaysOpen={Boolean(activeBed)}
                    countryArray={countryArray}
                    onClose={() => {
                        setVisibleComponent(null);
                    }}
                />;
        }
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <div className="has-bed-tile__cta-buttons d-flex flex-column">
                <Button
                    key="catalogRequest"
                    color="secondary"
                    size="medium"
                    className="m-2"
                    onClick={() => {
                        setVisibleComponent('catalogRequest');
                    }}>
                    {requestCatalog.text.cta}
                </Button>
                <Button
                    key="bookBedTest"
                    color="light"
                    size="medium"
                    className="m-2"
                    onClick={() => {
                        setVisibleComponent('bookBedTest');
                    }}>
                    {bookBedTest.text.cta}
                </Button>
                <Button
                    key="storeLocator"
                    href={storeLocator.link}
                    target="_blank"
                    color="light"
                    size="medium"
                    withArrow={false}
                    className="m-2">
                    {storeLocator.text.cta}
                </Button>
                {!shouldDisableBedConfigurator && (
                    <Button
                        key="bedConfigurator"
                        color="light"
                        size="medium"
                        className="m-2"
                        pending={pendingDialog}
                        onClick={() => {
                            setPendingDialog(true);
                            Promise.all([
                                bedOrderService.getBeds(),
                                locationService.getCountries(),
                            ]).then(
                                (response) => {
                                    setPendingDialog(false);
                                    setBeds(response[0]);
                                    setCountryArray(response[1]);
                                    setVisibleComponent('bedConfigurator');
                                },
                                () => {
                                    setPendingDialog(false);
                                },
                            );
                        }}>
                        {bedConfigurator.text.cta}
                    </Button>
                )}
                <ErrorBoundary
                    onError={() => {
                        setVisibleComponent(null);
                    }}>
                    <Dialog
                        size={visibleComponent === 'bedConfigurator' ? 'lg' : 'md'}
                        theme={visibleComponent === 'bookBedTest' ? 'dark' : 'light'}
                        hideCloseButton={visibleComponent === 'bedConfigurator'}
                        disableBackdropClick
                        open={visibleComponent !== null}
                        onClose={() => {
                            setVisibleComponent(null);
                        }}>
                        {getComponentToDisplay()}
                    </Dialog>
                </ErrorBoundary>
            </div>
        </ThemeProvider>
    );
}
