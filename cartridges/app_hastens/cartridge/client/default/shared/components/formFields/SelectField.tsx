import React, { useEffect, ReactElement } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import InputLabel from '@material-ui/core/InputLabel';

export interface SelectFieldProps {
    id?: string;
    label?: string;
    value: string;
    options: {
        label: string;
        value: any;
        leftAvatar?: string;
    }[];
    onChange: (value) => void;
    onBlur?: (event) => void;
    onFocus?: (event) => void;
    error?: boolean;
    placeholder?: string;
    errorText?: string;
}

SelectField.defaultProps = {
    value: '',
    options: [],
};

export function SelectField(props: SelectFieldProps): ReactElement {

    useEffect(() => {
        // Default to first value if nothing is selected
        if (props.options.length === 1) {
            props.onChange(props.options[0].value);
        }
    }, []);

    useEffect(() => {
        // Check if selected value exists in menu items
        if (props.value) {
            const selectedOption = props.options.find((option) => option.value === props.value);
            if (!selectedOption) {
                props.onChange('');
            }
        }
    }, [props.value]);

    return (
        <FormControl fullWidth variant="outlined" size="small" error={props.error}>
            <InputLabel htmlFor={props.id}>{props.label}</InputLabel>
            <Select
                id={props.id}
                label={props.label}
                displayEmpty={!!props.placeholder}
                value={props.value}
                onBlur={props.onBlur}
                onFocus={props.onFocus}
                onChange={(event) => {
                    props.onChange(event.target.value);
                }}>
                {props.placeholder && (
                    <MenuItem value="" disabled>{props.placeholder}</MenuItem>
                )}
                {props.options.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                        {option.leftAvatar && (
                            <ListItemIcon>
                                <Avatar alt={option.label} src={option.leftAvatar} />
                            </ListItemIcon>
                        )}
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText className="error-text" id={`${props.id}-helper-text`}>{props.error ? props.errorText : ''}</FormHelperText>
        </FormControl>
    );

}
