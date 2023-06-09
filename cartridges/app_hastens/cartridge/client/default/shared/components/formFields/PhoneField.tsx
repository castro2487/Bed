import React, { ReactElement, lazy, Suspense } from 'react';
import { TextField } from './TextField';

export interface PhoneFieldProps {
    id?: string;
    label?: string;
    value: string;
    country?: string;
    onChange: (value) => void;
    onBlur?: (event) => void;
    error?: boolean;
    errorText?: string;
}

PhoneField.defaultProps = {
    value: '',
};

const MuiPhoneNumber = lazy(() => import(/* webpackChunkName: "material-ui-phone-number" */ 'material-ui-phone-number'));

/**
 * Known problems in v2.2.6:
 * - The component will crash when defaultCountry is set to an invalid country after mount
 * - The component will crash when defaultCountry is empty or set to an invalid country initially, then changed at the same time as value and value doesn't start with "+"
 * - The component will crash when defaultCountry is empty or set to an invalid country initially, then changed to another country internally and then emptied at the same time as value
 */
export function PhoneField(props: PhoneFieldProps): ReactElement {

    const defaultCountry = (() => {
        if (props.country) {
            const lowerCaseCountry = props.country.toLowerCase();
            return lowerCaseCountry == 'je' ? 'gb' : lowerCaseCountry;
        }
        return '';
    })();

    return (
        <Suspense fallback={<TextField disabled pending label={props.label} />}>
            <MuiPhoneNumber
                fullWidth
                id={props.id}
                label={props.label}
                variant="outlined"
                size="small"
                defaultCountry={defaultCountry}
                preferredCountries={['us', 'gb', 'se']}
                disableAreaCodes
                countryCodeEditable
                autoFormat={false}
                value={props.value}
                onChange={(value) => {
                    props.onChange(value);
                }}
                onBlur={props.onBlur}
                error={props.error}
                helperText={props.error ? props.errorText : ''}
            />
        </Suspense>
    );

}
