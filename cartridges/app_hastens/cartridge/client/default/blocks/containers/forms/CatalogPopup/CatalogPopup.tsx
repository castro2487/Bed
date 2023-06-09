import React, { ReactElement, useEffect, useState } from 'react';
import { createStyles, makeStyles, ThemeProvider, Theme } from '@material-ui/core/styles';

import { Banner } from './Banner';
import { RequestCatalog, RequestCatalogTexts } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import { Confirmation, ConfirmText } from '../../../../shared/components/RequestCatalog/Confirmation';
import { useServer } from '../../../server/ServerProvider';
import { lightTheme } from '../../../../shared/muiTheme';
import { getCookie, setCookie } from '../../../../shared/helpers/cookies';
import Dialog from '../../../../shared/components/dialogs/Dialog';

export interface CatalogPopupContent {
    text: RequestCatalogTexts & ConfirmText & {
        bannerHeading: string;
        bannerBody: string;
        bannerCta: string;
        imgContent: string;
    };
}

enum Step { BANNER, FORM, CONFIRMATION }

const useStyles = makeStyles((theme: Theme) => createStyles({
    form: {
        width: 800,
        maxWidth: '100%',
        '& .has-request-catalog-form': {
            paddingTop: 60,
            paddingBottom: 60,
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: 45,
            paddingRight: 45,
        },
    },
    confirmation: {
        width: 800,
        maxWidth: '100%',
        [theme.breakpoints.up('sm')]: {
            paddingLeft: 45,
            paddingRight: 45,
        },
    },
}));

export default function CatalogPopup(): ReactElement {

    const secondsBeforeShowing = 160;
    const dialogHiddenForNumDays = 4;

    const classes = useStyles();
    const { content } = useServer<CatalogPopupContent>();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(Step.BANNER);

    useEffect(() => {
        if (popupShouldShow()) {
            setUpPopupListeners();
        }
    }, []);

    function popupShouldShow() {
        if (!consentGiven()) {
            return false;
        }
        if (!getCookie('catalogPopup')) {
            setCookie('catalogPopup', 'hide', dialogHiddenForNumDays);
            return true;
        }
        return false;
    }

    function setUpPopupListeners() {
        document.addEventListener('mouseleave', mouseLeaveHandler);
        document.addEventListener('scroll', scrollHandler);
        setTimeout(timeOutHandler, secondsBeforeShowing * 1000);
    }

    function removeEvents() {
        document.removeEventListener('mouseleave', mouseLeaveHandler, false);
        document.removeEventListener('scroll', scrollHandler, false);
    }

    function consentGiven() {
        return true === window.Cookiebot.consent.necessary;
    }

    function scrollHandler() {
        if (open) {
            return;
        }
        if (Math.round(document.body.scrollHeight * 0.85) < window.pageYOffset + window.innerHeight) {
            setOpen(true);
            removeEvents();
        }
    }

    function mouseLeaveHandler(event) {
        if (open) {
            return;
        }
        if (event.clientY < 0) {
            setOpen(true);
            removeEvents();
        }
    }

    function timeOutHandler() {
        if (!open) {
            setOpen(true);
            removeEvents();
        }
    }

    return (
        <Dialog
            size={false}
            disableBackdropClick
            open={open}
            onClose={() => {
                setOpen(false);
            }}>
            <ThemeProvider theme={lightTheme}>
                {{
                    [Step.BANNER]: (
                        <Banner
                            onClick={() => {
                                setActiveStep(Step.FORM);
                            }}
                        />
                    ),
                    [Step.FORM]: (
                        <RequestCatalog
                            className={classes.form}
                            text={{
                                formHeader: content.text.formHeader,
                                buttonCancel: content.text.buttonCancel,
                                buttonSend: content.text.buttonSend,
                                labelFirstName: content.text.labelFirstName,
                                labelLastName: content.text.labelLastName,
                                labelEmail: content.text.labelEmail,
                                labelPhone: content.text.labelPhone,
                                labelStreetAddress: content.text.labelStreetAddress,
                                labelApartment: content.text.labelApartment,
                                labelState: content.text.labelState,
                                labelCity: content.text.labelCity,
                                labelCountry: content.text.labelCountry,
                                labelZip: content.text.labelZip,
                                labelLanguage: content.text.labelLanguage,
                                labelNewsletter: content.text.labelNewsletter,
                                labelRequired: content.text.labelRequired,
                                labelConsent: content.text.labelConsent,
                            }}
                            headingSize="sm"
                            onCancelClick={() => {
                                setOpen(false);
                            }}
                            onFormSuccess={() => {
                                setActiveStep(Step.CONFIRMATION);
                            }}
                            origin="popup"
                        />
                    ),
                    [Step.CONFIRMATION]: (
                        <Confirmation
                            className={classes.confirmation}
                            onCloseClick={() => {
                                setOpen(false);
                            }}
                            text={{
                                confirmHeader: content.text.confirmHeader,
                                confirmBody: content.text.confirmBody,
                                buttonClose: content.text.buttonClose,
                            }}
                        />
                    ),
                }[activeStep]}
            </ThemeProvider>
        </Dialog>
    );

}
