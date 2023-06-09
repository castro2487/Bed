import React, { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import pick from 'lodash/pick';

import { useServer } from '../../../server/ServerProvider';
import { BookBedTestText, BookBedTest as Form } from '../../../../shared/components/BookBedTest/BookBedTest';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';
import { Banner, BookBedTestBannerText } from './Banner';

interface BookBedTestContent {
    showBanner: boolean;
    text: BookBedTestText & BookBedTestBannerText;
    defaultStore?: string;
    defaultCountry?: string;
}

const useStyles = makeStyles(() => createStyles({
    root: {
        background: '#000431',
        color: '#fff',
    },
}));

export function BookBedTest() {
    const classes = useStyles();
    const { content: { text, showBanner = false, defaultStore, defaultCountry } } = useServer<BookBedTestContent>();
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className={classes.root}>
            <AnimatedSteps index={activeStep}>
                {showBanner && (
                    <Banner
                        text={pick(text, [
                            'bannerHeading',
                            'bannerBody',
                            'bannerButton',
                        ])}
                        onButtonClick={() => {
                            setActiveStep(1);
                        }}
                    />
                )}
                <Form
                    text={pick(text, [
                        'heading',
                        'storeLocatorHeader',
                        'storeLocatorBody',
                        'storeLocatorNext',
                        'factsTimeHeader',
                        'factsTimeBody',
                        'factsParticipantHeader',
                        'factsParticipantBody',
                        'factsParticipantBody2',
                        'factsLocationHeader',
                        'factsLocationBody',
                        'userFormHeader',
                        'userFormBody',
                        'confirmationHeader',
                        'confirmationBody',
                        'confirmationClose',
                        'labelStore',
                        'labelCountry',
                        'labelFirstName',
                        'labelLastName',
                        'labelEmail',
                        'labelPhone',
                        'labelNewsLetter',
                        'labelRequired',
                        'labelConsent',
                        'buttonSubmit',
                        'buttonCancel',
                    ])}
                    onCloseClick={!showBanner ? undefined : () => {
                        setActiveStep(0);
                    }}
                    defaultStore={defaultStore}
                    defaultCountry={defaultCountry}
                />
            </AnimatedSteps>
        </div>
    );
}
