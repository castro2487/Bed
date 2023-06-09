import React, { useState, ReactElement } from 'react';
import { createStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import { Form } from './Form';
import { Confirmation } from './Confirmation';
import { useServer } from '../../../server/ServerProvider';
import { FormProvider } from '../../../../shared/components/formFields/FormProvider';
import { lightTheme } from '../../../../shared/muiTheme';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';

export interface WaitListContent {
    text: {
        formHeading: string;
        formIntro: string;
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
        confirmationHeading: string;
        confirmationBody: string;
        buttonSend: string;
        buttonClose: string;
    };
}

const useStyles = makeStyles(() => createStyles({
    root: {
        background: '#eee',
        color: '#000',
    },
}));

export default function WaitList(): ReactElement {

    const classes = useStyles();
    const server = useServer<WaitListContent>();
    const country = server.getAllowedCountry();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [defaultCountryCode] = useState(country);
    const [position] = useState({
        method: 'geoip',
        longitude: null,
        latitude: null,
    });

    return (
        <ThemeProvider theme={lightTheme}>
            <div className={classes.root}>
                <AnimatedSteps index={showConfirmation ? 1 : 0}>
                    <FormProvider>
                        <Form
                            defaultCountryCode={defaultCountryCode}
                            position={position}
                            onFormSubmitted={() => setShowConfirmation(true)}
                        />
                    </FormProvider>
                    <Confirmation onCloseClick={() => setShowConfirmation(false)} />
                </AnimatedSteps>
            </div>
        </ThemeProvider>
    );

}
