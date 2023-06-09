import './SummaryStep.scss';

import React, { Component, ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import cloneDeep from 'lodash/cloneDeep';

import { Button } from '../../../../../../../shared/components/formFields/Button';
import { StepProps } from '../../DialogContent';
import { FormField } from '../../../../../../../shared/components/formFields/FormField';
import { TextField, TextFieldProps } from '../../../../../../../shared/components/formFields/TextField';
import { FormProvider, FormContext } from '../../../../../../../shared/components/formFields/FormProvider';
import { SelectField, SelectFieldProps } from '../../../../../../../shared/components/formFields/SelectField';
import { PhoneField, PhoneFieldProps } from '../../../../../../../shared/components/formFields/PhoneField';
import { RecaptchaField, RecaptchaFieldProps } from '../../../../../../../shared/components/formFields/RecaptchaField';
import { requiredValidator, phoneNumberValidator } from '../../../../../../../shared/components/formFields/validators';
import { BedPrice, TabControl, BedTab } from '../../../../../../server/BedOrderService';
import { findDeep, defaultValue, getPropertyTranslation } from '../../../helpers';
import { SummaryFooter } from './SummaryFooter';
import { ServerContext } from '../../../../../../server/ServerProvider';
import { __, sfmcEvent, gtmEvent } from '../../../../../../../shared/helpers';
import CloseButton from '../../../../../../../shared/components/dialogs/CloseButton';

export interface SummaryState {
    price: string;
    captcha: string;
    loading: boolean;
    currency: string;
    totalLegsWorth: string;
}

interface SummaryToView {
    body: {
        value: string;
        label: string;
    }[];
    header: string;
    image?: string;
}

type OrderSummary = SummaryToView[];

export class SummaryStep extends Component<StepProps, SummaryState> {

    static contextType = ServerContext;

    state: SummaryState = {
        price: '',
        captcha: '',
        currency: '',
        loading: false,
        totalLegsWorth: null,
    };

    formatPrice(price, currency?: string): string {
        const formatted = Math.round(parseFloat(price || 0)).toLocaleString();
        return formatted && currency ? `${formatted} ${currency}` : formatted;
    }

    UNSAFE_componentWillMount() {
        const defaultCountry = this.props.countryArray.find((country) => country.code === this.props.defaultCountry);
        if (defaultCountry) {
            this.props.onChangeContact(defaultCountry.name, 'country');
        }

        sfmcEvent('bedConfiguratorToSummaryEvent', { ...this.props.form, customerNumber: this.props.customerNumber });
        this.context.bedOrderService.getBedsPrice({ bed: this.props.form, customerNumber: this.props.customerNumber }).then(
            (response: BedPrice) => {
                this.setState({
                    price: this.formatPrice(response.recFullPrice),
                    currency: response.currency,
                    totalLegsWorth: +response.totalLegsWorth > 0 ? this.formatPrice(response.totalLegsWorth) : response.totalLegsWorth,
                });
            },
        );
    }

    bedConfiguration(): OrderSummary {

        const { form, beds } = this.props;
        const configArray = [{
            body: [],
            header: 'Hästens ' + form.type,
            image: null,
        }];
        const bedProperty = beds.filter((bed) => bed.code === form.type)[0];

        bedProperty.tabs.forEach((tab: BedTab) => {
            const dataToView = {
                header: getPropertyTranslation(tab.displayName),
                body: [],
                image: null,
            };
            tab.controls.forEach((control: TabControl) => {
                const controlCopy = cloneDeep(control);
                const controlCode = controlCopy.code === 'size' ? form.width + '' + form.length : form[controlCopy.code];

                if (controlCopy.code === 'size') {
                    this.makeSizeOptionLoopAble(controlCopy);
                }

                const response = findDeep(controlCopy.data.options, controlCode) || controlCode;
                if (response) {
                    this.createViewData(dataToView, response.value || response, controlCopy);
                    if (controlCopy.code === 'color') {
                        configArray[0].image = response.image;
                    }
                }

            });
            configArray.push(dataToView);
        });
        return configArray;
    }

    private createViewData(dataToView: SummaryToView, response: string, controlCopy: TabControl) {
        dataToView.body = [
            ...dataToView.body,
            {
                value: response,
                label: getPropertyTranslation(controlCopy.displayName),
            },
        ];
    }

    private makeSizeOptionLoopAble(controlCopy: TabControl) {
        const tempOption = [];
        Object.keys(controlCopy.data.options).reverse().forEach((key) => {
            for (const option of controlCopy.data.options[key]) {
                tempOption.push({
                    ...option,
                    code: option.width + '' + option.length,
                });
            }
        });
        controlCopy.data.options = tempOption;
    }

    render(): ReactElement {
        return (
            <div className="has-bed-configurator-summary-step">
                <FormProvider>
                    <CloseButton className="close-button" onClick={this.props.onClose} />
                    <header>
                        <span>{__('bedconf.general_summary')}</span>
                    </header>
                    <div className="summary-step-container">
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} className="section">
                                <div className="bed-step-details">
                                    <Card className="details-card">
                                        <CardContent>
                                            {this.bedConfiguration().map((config, index) => (
                                                <section className="bed-details-section" key={config.header + index}>
                                                    {config.image ? <img src={config.image} /> : null}
                                                    {+index === 0 ? <p className="bed-details-header bed-name"><legend className="as-h1">{config.header}</legend></p> : <p className="as-h2 bed-details-header">{config.header}</p>}
                                                    {config.body.map(({ value, label }) => {
                                                        if (value !== defaultValue) {
                                                            return (
                                                                <p key={value + config.header + index}>
                                                                    <span className="bed-details-label">{label}:</span>
                                                                    <span>{value}</span>
                                                                </p>
                                                            );
                                                        }
                                                        return null;
                                                    },
                                                    )}
                                                </section>
                                            ))}
                                        </CardContent>
                                    </Card>
                                    <SummaryFooter {...this.state} />
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6} className="section">
                                <div className="contact-step-details">
                                    <fieldset className="contact-info">
                                        <legend className="as-h1">{__('bedconf.general_contact_information')}</legend>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="first-name"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.firstName')}
                                                    value={this.props.contact.firstname}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'firstname');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="last-name"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.lastName')}
                                                    value={this.props.contact.lastname}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'lastname');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="email"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    type="email"
                                                    label={__('forms.email')}
                                                    value={this.props.contact.email}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'email');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<PhoneFieldProps>
                                                    id="mobile-number"
                                                    component={PhoneField}
                                                    validators={[requiredValidator]}
                                                    asyncValidators={[phoneNumberValidator]}
                                                    label={__('forms.mobilephone')}
                                                    country={this.props.defaultCountry}
                                                    value={this.props.contact.phone}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'phone');
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </fieldset>

                                    <fieldset className="address-section">
                                        <legend className="as-h2">Address</legend>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="street-address"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.streetaddress')}
                                                    value={this.props.contact.street}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'street');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="suite-apartment"
                                                    component={TextField}
                                                    label={__('forms.apartment')}
                                                    value={this.props.contact.apartmentNumber}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'apartmentNumber');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="state-province"
                                                    component={TextField}
                                                    label={__('forms.state')}
                                                    value={this.props.contact.region}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'region');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="city"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.city')}
                                                    value={this.props.contact.city}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'city');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<TextFieldProps>
                                                    id="zip-postal-code"
                                                    component={TextField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.postcode')}
                                                    value={this.props.contact.zipCode}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'zipCode');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormField<SelectFieldProps>
                                                    id="country"
                                                    component={SelectField}
                                                    validators={[requiredValidator]}
                                                    label={__('forms.country')}
                                                    options={this.props.countryArray.map((country) => ({
                                                        label: country.name,
                                                        value: country.name,
                                                    }))}
                                                    value={this.props.contact.country}
                                                    onChange={(value) => {
                                                        this.props.onChangeContact(value, 'country');
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <p className="form-data-consent">{__('forms.consent')}</p>
                                            </Grid>
                                        </Grid>
                                    </fieldset>
                                    <fieldset className="captcha mt-2">
                                        <FormField<RecaptchaFieldProps>
                                            component={RecaptchaField}
                                            validators={[requiredValidator]}
                                            value={this.state.captcha}
                                            onChange={(value) => {
                                                this.setState({ captcha: value });
                                            }}
                                        />
                                    </fieldset>
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                    <footer className="button-container">
                        <Button
                            size="small"
                            color="dark"
                            onClick={() => {
                                this.props.onChangeStep('configuration');
                            }}>
                            Back
                        </Button>
                        <FormContext.Consumer>
                            {(context) => (
                                <Button
                                    size="small"
                                    color="secondary"
                                    disabled={!context.isValid()}
                                    pending={this.state.loading}
                                    onClick={() => {
                                        this.buyBedRequest();
                                    }}>
                                    {__('bedconf.general_request_quote')}
                                </Button>
                            )}
                        </FormContext.Consumer>
                    </footer>
                </FormProvider>
            </div>
        );
    }


    private buyBedRequest() {
        this.setState({ loading: true });
        const bedData = this.makeBedPropertiesReady(cloneDeep(this.props.form));
        const requestObject = {
            endConsumer: this.props.contact,
            beds: [bedData],
            accessories: {},
            recaptcha: this.state.captcha,
            isBedConfigurator: true,
            customerNumber: null,
            pageSlug: null,
        };

        if (this.props?.customerNumber) {
            requestObject.customerNumber = this.props.customerNumber;
            requestObject.pageSlug = this.context.content.store?.partnerSlug || 'hastens' + window.location.pathname;
        }

        this.context.bedOrderService.postQuote(requestObject).then(
            () => {
                this.setState({ loading: false }, () => {
                    this.props.onChangeStep('confirmation');
                });
                gtmEvent('Bedconfiguratorrequestaquote');
                sfmcEvent('bedConfiguratorEndEvent');
            },
            () => {
                this.setState({
                    loading: false,
                });
            },
        );
    }

    makeBedPropertiesReady(bedData) {
        const bedDataArry = Object.keys(bedData);
        bedDataArry.forEach((data) => {
            if (bedData[data] === defaultValue) {
                bedData[data] = '';
            }
        });
        return bedData;
    }
}
