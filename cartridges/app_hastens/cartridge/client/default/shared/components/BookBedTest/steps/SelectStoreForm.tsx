import React, { Fragment, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';

import { useBookBedState, useBookBedDispatch, SelectOption } from '../stateManagement';
import { Heading } from '../../typography/Heading';
import { FormField } from '../../formFields/FormField';
import { AutocompleteField, AutocompleteFieldProps } from '../../formFields/AutocompleteField';
import { requiredValidator } from '../../formFields/validators';
import { Button } from '../../formFields/Button';
import { useServer } from '../../../../blocks/server/ServerProvider';
import { BookBedTestText } from '../BookBedTest';
import { sfmcEvent } from '../../../helpers';
import { Paragraph } from '../../typography/Paragraph';

interface SelectStoreFormContent {
    onPrev: () => void;
    onNext: () => void;
    featuredStore?: string,
    text: BookBedTestText;
    defaultStore?: string;
    defaultCountry?: string;
}

export function SelectStoreForm({ defaultStore, defaultCountry, text, onPrev, onNext }: SelectStoreFormContent) {

    const { locationService, getAllowedCountry } = useServer();
    const fallBackCountry = 'NL';
    const appState = useBookBedState();
    const dispatch = useBookBedDispatch();

    useEffect(() => {
        if (defaultCountry) {
            getStores(defaultCountry);
        } else if (!appState.formData.country) {
            const country = getAllowedCountry();
            getStores(country);
        }
    }, []);

    useEffect(() => {

        let index = 0;
        let country = appState.formData.country;
        if (defaultStore && defaultCountry === (country?.value || country)) {
            country = defaultCountry;
            const stores = filterStoresByCountry(country);
            const store = stores.find((store) => store.value === defaultStore);
            const storeIndex = stores.indexOf(store);
            if (storeIndex !== -1) {
                index = storeIndex;
            }
        }
        const stores = filterStoresByCountry(country);
        if (country) {
            dispatch({ type: 'updateForm', data: { location: stores.length ? stores[index].value : null } });
        }

    }, [appState.formData.country]);

    function getStores(locatedCountry) {
        dispatch({
            type: 'updateState', data: {
                pendingCountries: true,
            },
        });
        locationService.getStores().then((response) => {
            const collectedCountries = {};

            const storesList = response.map((store) => {
                const key = store.address.country.name.split(' ').join('');

                collectedCountries[key] = {
                    value: store.address.country.code,
                    label: store.address.country.name,
                };

                return {
                    label: store.name,
                    value: store.id.toString(),
                    country: store.address.country.code,
                };
            });

            const countries = Object.keys(collectedCountries).sort().map((key) => collectedCountries[key]);

            const country = countries.find((item) => item.value === locatedCountry) || fallBackCountry;

            filterStoresByCountry(country.value || country, storesList);

            dispatch({
                type: 'updateState', data: {
                    countries,
                    storesList,
                    pendingCountries: false,
                },
            });

            dispatch({
                type: 'updateForm', data: {
                    country: country.value || country,
                },
            });

        }, () => {
            dispatch({
                type: 'updateState', data: {
                    pendingCountries: false,
                },
            });
        });
    }

    function filterStoresByCountry(country, storesList = appState.storesList): SelectOption[] {
        const stores = storesList.filter((store) => store.country === country) || [];
        dispatch({ type: 'updateState', data: { localStoreList: stores } });
        return stores;
    }

    const canProceed = () => appState.formData.country && appState.formData.location;

    function proceedToUserForm() {
        sfmcEvent('bookBedTestStartEvent');
        onNext();
    }

    return (
        <Fragment>
            <div className="step-header">
                <Heading level={3} size="md">{text.storeLocatorHeader}</Heading>
                {!!text.storeLocatorBody && (
                    <Paragraph>{text.storeLocatorBody}</Paragraph>
                )}
            </div>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <FormField<AutocompleteFieldProps>
                        component={AutocompleteField}
                        validators={[requiredValidator]}
                        label={text.labelCountry}
                        pending={appState.pendingCountries}
                        disabled={appState.pendingCountries}
                        options={appState.countries}
                        value={appState.formData.country}
                        onChange={(value) => dispatch({ type: 'updateForm', data: { country: value } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField<AutocompleteFieldProps>
                        component={AutocompleteField}
                        validators={[requiredValidator]}
                        label={text.labelStore}
                        pending={appState.pendingCountries}
                        disabled={appState.pendingCountries}
                        options={appState.localStoreList}
                        value={appState.formData.location}
                        onChange={(value) => dispatch({ type: 'updateForm', data: { location: value } })}
                    />
                </Grid>
            </Grid>
            <div className="buttons">
                {onPrev && (
                    <Button
                        type="button"
                        color="secondary"
                        onClick={onPrev}>
                        {text.buttonCancel}
                    </Button>
                )}
                <Button
                    type="button"
                    color="secondary"
                    onClick={proceedToUserForm}
                    disabled={!canProceed()}>
                    {text.storeLocatorNext}
                </Button>
            </div>
        </Fragment>
    );
}
