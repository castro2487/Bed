import './DialogContent.scss';

import React, { Component, ReactElement } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import { Bed, Contact } from '../../../../server/BedOrderService';
import { ConfigurationStep } from './steps/ConfigurationStep/ConfigurationStep';
import { SummaryStep } from './steps/SummaryStep/SummaryStep';
import { ConfirmationStep } from './steps/ConfirmationStep/ConfirmationStep';
import { ServerContext } from '../../../../server/ServerProvider';
import { Country } from '../../../../server/LocationService';
import { gtmEvent, sfmcEvent } from '../../../../../shared/helpers';

export type Step = 'configuration' | 'summary' | 'confirmation';

interface Props {
    beds: Bed[];
    selectedBed?: string;
    alwaysOpen?: boolean;
    onClose: () => void;
    countryArray: Country[];
}

interface State {
    form: {
        type: string;
        width: number;
        length: number;
        color: string;
        split_base: string;
        nameplate: string;
        left_nameplate: string;
        right_nameplate: string;
        split_mattress: string;
        firmness: string;
        split_top_mattress: string;
        top_mattress_type: string;
        legs: string;
        middle_leg_link: string;
        quantity: number;
    };
    activeStepKey: Step;
    contact: Contact;
    backMode: boolean;
    customerNumber: string;
    configurationComplete: boolean;
    defaultCountry: string;
}

export interface StepProps {
    beds: Bed[];
    form: any;
    backMode: boolean;
    alwaysOpen?: boolean;
    contact: Contact;
    onClose?: () => void;
    onChangeStep: (step: Step) => void;
    onChangeForm: (path, value) => void;
    countryArray: Country[];
    defaultCountry: string;
    onChangeContact: (value: string, field: string) => void;
    customerNumber: string;
}

const defaultProps = {
    beds: [],
};

const initialForm = {
    quantity: 1,
    split_base: 'no',
    split_mattress: 'no',
    split_top_mattress: 'no',
};

const initialContact = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    street: '',
    region: '',
    city: '',
    zipCode: '',
    country: '',
    apartmentNumber: '',
};

const initialState = {
    form: cloneDeep(initialForm),
    activeStepKey: 'configuration',
    backMode: false,
    contact: cloneDeep(initialContact),
    customerNumber: '',
    configurationComplete: false,
    defaultCountry: '',
} as State;

const steps = [
    {
        key: 'configuration',
        component: ConfigurationStep,
    },
    {
        key: 'summary',
        component: SummaryStep,
    },
    {
        key: 'confirmation',
        component: ConfirmationStep,
    },
];

export class DialogContent extends Component<Props, State> {

    static contextType = ServerContext;
    static defaultProps = defaultProps;
    state = initialState;

    componentDidMount() {
        if (this.props.selectedBed) {
            sfmcEvent('bedConfiguratorStartEvent');
            this.updateState('type', this.props.selectedBed);
        }
        const customerCountry = this.context.getAllowedCountry(this.props.countryArray.map((country) => country.code));
        this.context.locationService.getCustomerDetails(this.context.content.store?.countryCode ?? customerCountry, this.context.content.store?.customerNumber).then((details) => {
            if (details && details.customerNumber) {
                this.setState({ customerNumber: details.customerNumber });
            }
        });
        this.setState({ defaultCountry: customerCountry });
    }

    updateState(path: string, value: any) {
        this.setState((prevState) => {
            const nextState = cloneDeep(prevState) as any;
            if (path === 'type') {
                nextState.form = { ...initialForm, type: value };
            } else {
                set(nextState.form, path, value);
            }
            return nextState;
        });
    }

    getStepIndex(stepKey: Step): number {
        return steps.findIndex((step) => step.key === stepKey);
    }

    isSteppingBackwards(prevStep: Step, nextStep: Step): boolean {
        const prevStepIndex = this.getStepIndex(prevStep);
        const nextStepIndex = this.getStepIndex(nextStep);
        return prevStepIndex > nextStepIndex;
    }

    updateContact(value, field) {
        this.setState({ contact: { ...this.state.contact, [field]: value } });
    }

    render(): ReactElement {
        const activeStep = steps.find((step) => step.key === this.state.activeStepKey);
        const { component: ActiveStepComponent } = activeStep;

        return (
            <div className="has-bed-configurator-dialog-content">
                <div className="spacer"></div>
                <div className="step-wrapper">
                    <ActiveStepComponent
                        beds={this.props.beds}
                        form={this.state.form}
                        backMode={this.state.backMode}
                        alwaysOpen={Boolean(this.props.alwaysOpen)}
                        contact={this.state.contact}
                        countryArray={this.props.countryArray}
                        defaultCountry={this.state.defaultCountry}
                        onChangeContact={(value, field) => {
                            this.updateContact(value, field);
                        }}
                        customerNumber={this.state.customerNumber}
                        onChangeForm={(path, value) => {
                            this.updateState(path, value);
                        }}
                        onChangeStep={(step) => {
                            if (step === 'summary' && this.state.configurationComplete === false) {
                                gtmEvent('Bedconfiguratorcompleted');
                                this.setState({ configurationComplete: true });
                            }
                            this.setState((prevState) => {
                                const nextState = cloneDeep(prevState) as State;
                                nextState.activeStepKey = step;
                                if (this.isSteppingBackwards(prevState.activeStepKey, step)) {
                                    nextState.backMode = true;
                                } else {
                                    nextState.backMode = false;
                                }
                                return nextState;
                            });
                        }}
                        onClose={this.props.onClose}
                    />
                </div>
            </div>
        );
    }

}
