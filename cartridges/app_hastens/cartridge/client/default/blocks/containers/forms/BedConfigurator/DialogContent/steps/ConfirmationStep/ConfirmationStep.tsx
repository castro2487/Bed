import './ConfirmationStep.scss';

import React, { Component, ReactElement } from 'react';
import Container from '@material-ui/core/Container';
import Check from '@material-ui/icons/Check';

import { StepProps } from '../../DialogContent';
import { Button } from '../../../../../../../shared/components/formFields/Button';
import CloseButton from '../../../../../../../shared/components/dialogs/CloseButton';
import { __ } from '../../../../../../../shared/helpers';

export class ConfirmationStep extends Component<StepProps, any> {

    render(): ReactElement {
        return (
            <div className="has-bed-configurator-confirmation-step">
                <CloseButton className="close-button" onClick={this.props.onClose} />
                <header>
                    <span>{__('bedconf.general_confirmation_header')}</span>
                </header>
                <div className="confirmation-step-container">
                    <Container maxWidth="sm">
                        <p className="as-h2">{__('bedconf.general_confirmation_text1')}</p>
                        <p>{__('bedconf.general_confirmation_text2')}</p>
                        <div className="icon-container">
                            <Check className="circle-icon" />
                        </div>
                        <div>
                            <p>{__('bedconf.general_confirmation_text3')}</p>
                        </div>
                    </Container>
                </div>
                <footer className="button-container">
                    <Button
                        color="dark"
                        size="small"
                        onClick={() => {this.props.onClose();}}>
                        {__('buttons.close')}
                    </Button>
                </footer>
            </div>
        );
    }
}
