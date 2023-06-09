import React, { ReactElement } from 'react';
import MuiTextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface TextFieldProps {
    id?: string;
    label?: string;
    value: string;
    type?: string;
    onChange?: (value) => void;
    onBlur?: (event) => void;
    onFocus?: (event) => void;
    error?: boolean;
    errorText?: string;
    placeholder?: string;
    disabled?: boolean;
    pending?: boolean;
    className?: string;
}

TextField.defaultProps = {
    value: '',
    pending: false,
};

const useStyles = makeStyles(() => createStyles({
    input: {
        paddingRight: 9,
    },
}));

export function TextField(props: TextFieldProps): ReactElement {
    const classes = useStyles();

    return (
        <MuiTextField
            fullWidth
            variant="outlined"
            size="small"
            id={props.id}
            type={props.type}
            label={props.label}
            value={props.value}
            placeholder={props.placeholder}
            disabled={props.disabled}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            onChange={(event) => {
                props.onChange(event.target.value);
            }}
            error={props.error}
            helperText={props.error ? props.errorText : ''}
            className={props.className}
            InputProps={{
                classes: { root: classes.input },
                endAdornment: props.pending && (
                    <InputAdornment position="end">
                        <CircularProgress size={16} thickness={6} color="inherit" />
                    </InputAdornment>
                ),
            }}
        />
    );

}
