import React, { ReactElement, useState } from 'react';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import isString from 'lodash/isString';
import omit from 'lodash/omit';

export interface AutosizeTextFieldProps {
    id?: string;
    label?: string;
    value: string;
    type?: string;
    onChange: (value) => void;
    onBlur?: (event) => void;
    onFocus?: (event) => void;
    error?: boolean;
    errorText?: string;
    placeholder?: string;
    className?: string;
    rows?: number;
    centered?: boolean;
}

const useMultilineStyles = makeStyles({
    input: (props: AutosizeTextFieldProps) => ({
        textAlign: props.centered ? 'center' : null,
    }),
});

AutosizeTextField.defaultProps = {
    value: '',
};

export function AutosizeTextField(props: AutosizeTextFieldProps): ReactElement {

    const [focused, setFocused] = useState(false);
    const multilineStyles = useMultilineStyles(props);
    const rows = getRowCount();

    function getRowCount(): number {
        const defaultRows = props.rows || 1;
        if (focused) {
            return defaultRows;
        }
        const valueRowCount = isString(props.value) ? props.value.split('\n').length : 1;
        return Math.min(valueRowCount, defaultRows);
    }

    return (
        <FormControl fullWidth size="small" error={props.error}>
            <InputLabel htmlFor={props.id}>{props.label}</InputLabel>
            <OutlinedInput
                multiline
                id={props.id}
                inputComponent={CustomTextareaAutosize}
                classes={{
                    root: props.className,
                    input: multilineStyles.input,
                }}
                label={props.label}
                placeholder={props.placeholder}
                rows={rows}
                type={props.type}
                value={props.value}
                onFocus={(event) => {
                    setFocused(true);
                    if (props.onFocus) {
                        props.onFocus(event);
                    }
                }}
                onBlur={(event) => {
                    setFocused(false);
                    if (props.onBlur) {
                        props.onBlur(event);
                    }
                }}
                onChange={(event) => {
                    props.onChange(event.target.value);
                }}
            />
            <FormHelperText>{props.error ? props.errorText : ''}</FormHelperText>
        </FormControl>
    );

}

// Remove inputRef warning
function CustomTextareaAutosize(props) {
    return <TextareaAutosize {...omit(props, 'inputRef')} />;
}
