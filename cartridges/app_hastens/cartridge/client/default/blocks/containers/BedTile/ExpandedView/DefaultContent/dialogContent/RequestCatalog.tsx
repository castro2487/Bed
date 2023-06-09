import React, { useState, ReactElement } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

import { RequestCatalog as RequestCatalogForm } from '../../../../../../shared/components/RequestCatalog/RequestCatalog';
import { useServer } from '../../../../../server/ServerProvider';
import { Confirmation } from '../../../../../../shared/components/RequestCatalog/Confirmation';
import { lightTheme } from '../../../../../../shared/muiTheme';
import { BedTileContent } from '../../../helpers';
import AnimatedSteps from '../../../../../../shared/components/AnimatedSteps';

export function RequestCatalog({ onClose }): ReactElement {
    const { content: { requestCatalog: { text } } } = useServer<BedTileContent>();
    const [activeStep, setActiveStep] = useState(0);

    return (
        <ThemeProvider theme={lightTheme}>
            <AnimatedSteps index={activeStep}>
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
                    onCancelClick={onClose}
                    onFormSuccess={() => {
                        setActiveStep(1);
                    }}
                />
                <Confirmation
                    onCloseClick={onClose}
                    text={{
                        confirmHeader: text.confirmHeader,
                        confirmBody: text.confirmBody,
                        buttonClose: text.buttonClose,
                    }}
                />
            </AnimatedSteps>
        </ThemeProvider>
    );

}
