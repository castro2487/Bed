import './ConfigurationStep.scss';

import React, { Component, ReactNode } from 'react';
import withWidth from '@material-ui/core/withWidth';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';

import { BedSelectField, BedSelectFieldProps } from './BedSelectField';
import { StepProps } from '../../DialogContent';
import { ConfigurationControl } from './ConfigurationControl';
import { FormProvider, FormContext } from '../../../../../../../shared/components/formFields/FormProvider';
import { Button } from '../../../../../../../shared/components/formFields/Button';
import { FormField } from '../../../../../../../shared/components/formFields/FormField';
import { requiredValidator } from '../../../../../../../shared/components/formFields/validators';
import { BedTabs } from './BedTabs';
import { ruleEvaluatorService } from '../../../ruleEvaluatorService';
import { __, sfmcEvent } from '../../../../../../../shared/helpers';
import CloseButton from '../../../../../../../shared/components/dialogs/CloseButton';

interface State {
    activeTab: number;
    configurationIsOpen: boolean;
}

const defaultProps = {
    beds: [],
};

const initialState = {
    activeTab: 0,
    configurationIsOpen: false,
} as State;


class ConfigurationStepWithWidth extends Component<StepProps & {width: 'xs' | 'sm' | 'md' | 'lg' | 'xl'}, State> {

    static defaultProps = defaultProps;
    state = initialState;

    componentDidMount() {
        if (this.props.backMode) {
            this.setState({
                activeTab: this.getLastTabIndex(),
                configurationIsOpen: true,
            });
        }
        if (this.props.alwaysOpen) {
            this.setState({ configurationIsOpen: true });
        }
    }

    getSelectedBed() {
        const selectedBed = this.props.beds.find((bed) => bed.code === this.props.form.type);

        if (selectedBed) {
            selectedBed.tabs = selectedBed.tabs.map((tab) => {
                let isDisabled = true;
                tab.controls.forEach((control) => {
                    if (!ruleEvaluatorService.evaluate(control.rules, this.props.form)) {
                        return;
                    }
                    isDisabled = false;
                });
                return { ...tab, isDisabled };
            });
        }

        return selectedBed;
    }

    isNextTabDisabled(tabIndex) {
        const tab = this.getSelectedBed().tabs[tabIndex + 1];
        if (tab.isDisabled) {
            return true;
        }
        return false;
    }

    getLastTabIndex() {
        const selectedBed = this.getSelectedBed();
        return selectedBed.tabs.length - 1;
    }

    isFirstTab(tabIndex: number) {
        return tabIndex === 0;
    }

    isLastTab(tabIndex: number) {
        return tabIndex === this.getLastTabIndex();
    }

    render(): ReactNode {
        const selectedBed = this.getSelectedBed();
        const alwaysOpen = this.props.alwaysOpen || this.props.width === 'xs';
        const configurationIsOpen = this.state.configurationIsOpen || alwaysOpen;

        return (
            <FormProvider>
                <div
                    className={clsx(
                        'has-bed-configurator-configuration-step',
                        { 'configuration-is-open': configurationIsOpen },
                    )}>
                    <CloseButton className="close-button" onClick={this.props.onClose} />
                    <div className="bed-selection">
                        {configurationIsOpen && Boolean(selectedBed) && (
                            <BedTabs
                                tabs={selectedBed.tabs}
                                activeTab={this.state.activeTab}
                                onChangeActiveTab={(activeTab) => {
                                    this.setState({ activeTab });
                                }}
                            />
                        )}
                        <div className="selected-bed-title">
                            <span>Hästens</span>
                            {selectedBed && (
                                <span>{selectedBed.displayName}</span>
                            )}
                        </div>
                        <div className="large-images">
                            {this.props.beds.map((item, index) => (
                                <div
                                    key={index}
                                    className={clsx({
                                        selected: selectedBed && (selectedBed.code === item.code),
                                    })}
                                    style={{ backgroundImage: `url(${item.images.large})` }}>
                                </div>
                            ))}
                        </div>
                        <div className="bottom-container">
                            {!configurationIsOpen && Boolean(selectedBed) && (
                                <Button
                                    appearance="outlined"
                                    color="light"
                                    className="start-button"
                                    onClick={() => {
                                        sfmcEvent('bedConfiguratorStartEvent');
                                        this.setState({ configurationIsOpen: true });
                                    }}>
                                    {__('bedconf.general_configure').replace('{0}', selectedBed.displayName)}
                                </Button>
                            )}
                            <FormField<BedSelectFieldProps>
                                component={BedSelectField}
                                validators={[requiredValidator]}
                                options={this.props.beds}
                                value={this.props.form.type}
                                onChange={(value) => {
                                    this.props.onChangeForm('type', value);
                                    this.setState({ activeTab: 0 });
                                }}
                            />
                        </div>
                    </div>
                    {Boolean(selectedBed) && (
                        <div className="configuration-panels">
                            {selectedBed.tabs.map((tab, tabIndex) => (
                                <div
                                    key={`${selectedBed.code}--${tabIndex}`}
                                    className={clsx(
                                        'configuration-panel',
                                        { 'active': tabIndex === this.state.activeTab },
                                    )}>
                                    <header>
                                        <span>{__('partner.bedconfigurator.header')}</span>
                                    </header>
                                    <div className="scroll-wrapper">
                                        {tab.controls.map((control, controlIndex) => (
                                            <ConfigurationControl
                                                key={controlIndex}
                                                groupId={`panel-${tabIndex}`}
                                                control={control}
                                                form={this.props.form}
                                                onChangeForm={(path, value) => {
                                                    this.props.onChangeForm(path, value);
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <footer>
                                        {this.isFirstTab(tabIndex) && !alwaysOpen && (
                                            <Button
                                                color="dark"
                                                size="small"
                                                className="back-button"
                                                onClick={() => {
                                                    this.setState({ configurationIsOpen: false });
                                                }}>
                                                Back
                                            </Button>
                                        )}
                                        {!this.isFirstTab(tabIndex) && (
                                            <Button
                                                color="dark"
                                                size="small"
                                                className="back-button"
                                                onClick={() => {
                                                    this.setState((prevState) => {
                                                        const nextState = cloneDeep(prevState) as State;
                                                        nextState.activeTab--;
                                                        return nextState;
                                                    });
                                                }}>
                                                {__('bedconf.general_back')}
                                            </Button>
                                        )}
                                        {this.isLastTab(tabIndex) && (
                                            <FormContext.Consumer>
                                                {(form) => (
                                                    <Button
                                                        color="secondary"
                                                        size="small"
                                                        disabled={!form.isValid()}
                                                        onClick={() => {
                                                            this.props.onChangeStep('summary');
                                                        }}>
                                                        {__('bedconf.general_to_summary')}
                                                    </Button>
                                                )}
                                            </FormContext.Consumer>
                                        )}
                                        {!this.isLastTab(tabIndex) && (
                                            <Button
                                                color="secondary"
                                                size="small"
                                                disabled={this.isNextTabDisabled(tabIndex)}
                                                onClick={() => {
                                                    this.setState((prevState) => {
                                                        const nextState = cloneDeep(prevState) as State;
                                                        nextState.activeTab++;
                                                        return nextState;
                                                    });
                                                }}>
                                                {__('bedconf.general_continue')}
                                            </Button>
                                        )}
                                    </footer>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FormProvider>
        );
    }

}

export const ConfigurationStep = withWidth()(ConfigurationStepWithWidth);
