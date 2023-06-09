import React, { ReactElement } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface AutocompleteFieldProps {
    id?: string;
    label?: string;
    value: string | number;
    onChange: (value) => void;
    onBlur?: (event) => void;
    error?: boolean;
    errorText?: string;
    options: Option[];
    pending?: boolean;
    disabled?: boolean;
}

interface Option {
    label: string;
    value: any;
}

AutocompleteField.defaultProps = {
    value: '',
};

const useStyles = makeStyles(() => createStyles({
    adornment: {
        position: 'absolute',
        top: '50%',
        right: 9,
    },
}));

export function AutocompleteField(props: AutocompleteFieldProps): ReactElement {
    const classes = useStyles();
    const selectedOption = props.options.find((option) => option.value === props.value);

    return (
        <Autocomplete
            id={props.id}
            aria-labelledby={`${props.id}-label`} /* WCAG bugfix */
            autoHighlight
            disableClearable
            disabled={props.disabled}
            getOptionLabel={(option) => option.label}
            options={props.options}
            value={selectedOption || null}
            onChange={(event, option: Option) => {
                props.onChange(option.value);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    size="small"
                    label={props.label}
                    error={props.error}
                    helperText={props.error ? props.errorText : null}
                    onBlur={props.onBlur}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'disabled',
                    }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: !props.pending ? params.InputProps.endAdornment : (
                            <InputAdornment position="end" classes={{ root: classes.adornment }}>
                                <CircularProgress size={16} thickness={6} color="inherit" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );

}
