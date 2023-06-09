import React, { Component, ReactNode } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Info from '@material-ui/icons/Info';
import cloneDeep from 'lodash/cloneDeep';

import { ListSelectField, ListSelectFieldProps } from '../../../../../../../shared/components/formFields/ListSelectField';
import { TabControl, DataOption, SizeDataOption } from '../../../../../../server/BedOrderService';
import { AutosizeTextField, AutosizeTextFieldProps } from '../../../../../../../shared/components/formFields/AutosizeTextField';
import { SelectField, SelectFieldProps } from '../../../../../../../shared/components/formFields/SelectField';
import { SizeField, SizeFieldProps } from '../../../../../../../shared/components/formFields/SizeField';
import { FormField } from '../../../../../../../shared/components/formFields/FormField';
import { requiredValidator, maxLinesValidator, maxCharactersValidator } from '../../../../../../../shared/components/formFields/validators';
import { ruleEvaluatorService } from '../../../ruleEvaluatorService';
import { defaultValue, getPropertyTranslation } from '../../../helpers';
import { ServerContext } from '../../../../../../server/ServerProvider';

interface Props {
    control: TabControl;
    form: any;
    groupId: string;
    onChangeForm: (path, value) => void;
}

export class ConfigurationControl extends Component<Props, any> {
    static contextType = ServerContext;

    filterDataOptions(options: DataOption[]) {
        return options.filter((option) => {
            return ruleEvaluatorService.evaluate(option.rules, this.props.form) && !option.disabled;
        });
    }

    getPreferredNation(): string {
        switch (this.context.getAllowedCountry()) {
            case 'US':
                return 'US';
            case 'GB':
                return 'UK';
            default:
                return 'ROW';
        }
    }

    render(): ReactNode {
        if (!ruleEvaluatorService.evaluate(this.props.control.rules, this.props.form)) {
            return null;
        }

        return (
            <div className={`configuration-control data-type--${this.props.control.dataType}`}>
                <div className="control-name">
                    <span>{getPropertyTranslation(this.props.control.displayName)}</span>
                    {Boolean(this.props.control.description) && (
                        <Tooltip
                            title={this.props.control.description}
                            aria-label={this.props.control.description}
                            placement="right"
                            enterTouchDelay={0}
                            leaveTouchDelay={1000000}>
                            <div className="info-icon">
                                <Info fontSize="inherit" color="inherit" />
                            </div>
                        </Tooltip>
                    )}
                </div>
                {this.renderControl()}
            </div>
        );
    }

    renderControl(): ReactNode {
        switch (this.props.control.dataType) {
            case 'list': return this.renderListControl();
            case 'choice': return this.renderChoiceControl();
            case 'size': return this.renderSizeControl();
            case 'text': return this.renderTextControl();
            default: return null;
        }
    }

    renderListControl(): ReactNode {
        const options = this.filterDataOptions(
            cloneDeep(this.props.control.data.options) as DataOption[],
        ).map((option) => {
            if (option.code === '') {
                return { ...option, code: defaultValue };
            }
            return option;
        });

        return (
            <FormField<ListSelectFieldProps>
                component={ListSelectField}
                validators={[
                    requiredValidator,
                ]}
                groupId={this.props.groupId}
                value={this.props.form[this.props.control.code]}
                onChange={(value) => {
                    this.props.onChangeForm(this.props.control.code, value);
                }}
                options={options.map((option) => ({
                    value: option.code,
                    label: option.displayCode && option.displayCode !== '' ? getPropertyTranslation(option.displayCode) : option.displayName,
                    avatar: option.image,
                }))}
            />
        );
    }

    renderChoiceControl(): ReactNode {
        const options = this.filterDataOptions(
            cloneDeep(this.props.control.data.options) as DataOption[],
        ).map((option) => {
            if (option.code === '') {
                return { ...option, code: defaultValue };
            }
            return option;
        });
        const defaultOption = options.filter((option) => option.code === defaultValue);
        if (defaultOption.length > 0 && !this.props.form[this.props.control.code]) {
            setTimeout(() => {
                this.props.onChangeForm(this.props.control.code, defaultOption[0].code);
            }, 1000);
        }
        return (
            <div className="form-field">
                <FormField<SelectFieldProps>
                    component={SelectField}
                    validators={[
                        requiredValidator,
                    ]}
                    groupId={this.props.groupId}
                    placeholder={getPropertyTranslation(this.props.control.displayName)}
                    value={this.props.form[this.props.control.code]}
                    onChange={(value) => {
                        this.props.onChangeForm(this.props.control.code, value);
                    }}
                    options={options.map((option) => ({
                        value: option.code,
                        label: option.displayCode && option.displayCode !== '' ? getPropertyTranslation(option.displayCode) : option.displayName,
                    }))}
                />
            </div>
        );
    }

    renderSizeControl(): ReactNode {
        const options = this.props.control.data.options as { [nation: string]: SizeDataOption[] };

        return (
            <div className="form-field">
                <FormField<SizeFieldProps>
                    component={SizeField}
                    validators={[
                        requiredValidator,
                    ]}
                    groupId={this.props.groupId}
                    value={{
                        width: this.props.form.width,
                        length: this.props.form.length,
                    }}
                    selectPlaceholder={getPropertyTranslation(this.props.control.displayName)}
                    onChange={(value) => {
                        this.props.onChangeForm('width', value.width);
                        this.props.onChangeForm('length', value.length);
                    }}
                    minWidth={this.props.control.minWidth}
                    maxWidth={this.props.control.maxWidth}
                    minLength={this.props.control.minLength}
                    maxLength={this.props.control.maxLength}
                    options={options}
                    preferredNation={this.getPreferredNation()}
                />
            </div>
        );
    }

    renderTextControl(): ReactNode {
        return (
            <div className="form-field">
                <FormField<AutosizeTextFieldProps>
                    component={AutosizeTextField}
                    validators={[
                        maxLinesValidator(2),
                        maxCharactersValidator(22, 17),
                    ]}
                    groupId={this.props.groupId}
                    centered
                    rows={2}
                    placeholder={getPropertyTranslation(this.props.control.displayName)}
                    value={this.props.form[this.props.control.code]}
                    onChange={(value) => {
                        this.props.onChangeForm(this.props.control.code, value);
                    }}
                />
            </div>
        );
    }

}
