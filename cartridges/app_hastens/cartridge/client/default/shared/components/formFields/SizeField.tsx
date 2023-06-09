import './SizeField.scss';

import React, { ReactElement, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import CloseOutlined from '@material-ui/icons/CloseOutlined';
import PhotoSizeSelectSmall from '@material-ui/icons/PhotoSizeSelectSmall';
import omit from 'lodash/omit';
import { BoxSizingProperty } from 'csstype';

import { convertToInt } from '../../helpers';

export interface SizeFieldProps {
    id?: string;
    selectPlaceholder?: string;
    customPlaceholder?: string;
    fullWidth?: boolean;
    value: {
        width: number;
        length: number;
    };
    options: {
        [nation: string]: MenuItem[];
    };
    minWidth?: number;
    maxWidth?: number;
    minLength?: number;
    maxLength?: number;
    error?: boolean;
    errorText?: string;
    selectHelpText?: string;
    customHelpText?: string;
    onChange?: (value: Size, event?: Event) => void;
    onBlur?: (event) => void;
    disabled?: boolean;
    placeholder?: string;
    allowCustomSize?: boolean;
    preferredNation?: string;
}

interface Size {
    width: number;
    length: number;
}

interface MenuItem {
    width: number;
    length: number;
    displayName: string;
}

SizeField.defaultProps = {
    value: {
        width: 0,
        length: 0,
    },
};

const useSelectStyles = makeStyles({
    root: {
        paddingLeft: 50,
    },
});

const useTextFieldStyles = makeStyles({
    root: {
        '& input': {
            paddingLeft: 50,
        },
    },
});

export function SizeField(props: SizeFieldProps): ReactElement {

    const [customMode, setCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [showAllMode, setShowAllMode] = useState(false);
    const [selectIsOpen, setSelectIsOpen] = useState(false);

    const selectStyles = useSelectStyles();
    const textFieldStyles = useTextFieldStyles();

    const options = getOptions();

    useEffect(() => {
        switchModeIfNonExistingValue();
    });

    function switchModeIfNonExistingValue() {
        if (!options || !options.length) {
            return;
        }
        const width = convertToInt(props.value.width);
        const length = convertToInt(props.value.length);
        if (!width && !length) {
            return;
        }
        const selected = options.find((item: MenuItem) => {
            return item.width === width && item.length === length;
        });
        if (selected) {
            return;
        }
        if (showAllMode && !customMode) {
            const cmWidth = String(width / 10).replace('.', ',');
            const cmLength = String(length / 10).replace('.', ',');
            setCustomMode(true);
            setCustomValue(`${cmWidth}x${cmLength}`);
        } else if (!showAllMode) {
            setShowAllMode(true);
        }
    }

    function resetValue() {
        props.onChange({
            width: 0,
            length: 0,
        });
    }

    function changeToCustomMode() {
        setCustomMode(true);
        setSelectIsOpen(false);
    }

    function changeToSelectMode() {
        resetValue();
        setCustomMode(false);
        setCustomValue('');
    }

    function changeToShowAllMode() {
        setShowAllMode(true);
    }

    function prepareValue() {
        if (props.value) {
            const width = convertToInt(props.value.width);
            const length = convertToInt(props.value.length);
            const selected = options.find((item: MenuItem) => {
                return item.width === width && item.length === length;
            });
            if (selected) {
                return selected.displayName;
            }
        }
        return '';
    }

    function handleChangeSelect(event) {
        const selected = options.find((item: MenuItem) => item.displayName === event.target.value);
        if (selected) {
            props.onChange({
                width: selected.width,
                length: selected.length,
            }, event);
        } else {
            resetValue();
        }
    }

    function handleChangeCustom(event) {
        let value = event.target.value;
        if (value.length) {
            switch (value[value.length - 1]) {
                case ' ':
                case 'X':
                    value = value.substr(0, value.length - 1) + 'x';
                    break;
                case '.':
                    value = value.substr(0, value.length - 1) + ',';
                    break;
            }
            if (!value.match(/^[1-9][0-9]{0,2}(,[0|5]?)?(x([1-9][0-9]{0,2}(,[0|5]?)?)?)?$/)) {
                return;
            }
        }
        setCustomValue(value);
    }

    function handleBlurCustom(event) {
        if (customValue) {
            const dimensions = customValue.split('x');
            const width = parseFloat(dimensions[0].replace(',', '.')) || 0;
            const length = parseFloat(dimensions[1].replace(',', '.')) || 0;
            props.onChange({
                width: width * 10,
                length: length * 10,
            });
        } else {
            resetValue();
        }
        if (props.onBlur) {
            props.onBlur(event);
        }
    }

    function handleKeyDownSelect(event) {
        // Close dropdown when keyboard shortcuts are used
        if (event.ctrlKey && event.keyCode >= 65 && event.keyCode <= 90) {
            setSelectIsOpen(false);
        }
    }

    function getPreferedOptions() {
        if (!props.options) {
            return [];
        }
        const preferredNation = props.preferredNation || 'ROW';
        if (showAllMode) {
            const preferedOptions = props.options[preferredNation];
            const otherOptions = omit(props.options, preferredNation);
            return [].concat(
                preferedOptions,
                ...Object.keys(otherOptions).map((key) => {
                    return otherOptions[key].filter((otherMenuItem) => {
                        return !preferedOptions.find((preferedMenuItem) => {
                            return preferedMenuItem.length === otherMenuItem.length && preferedMenuItem.width === otherMenuItem.width;
                        });
                    });
                }),
            );
        }
        return props.options[preferredNation];
    }

    function getOptions(): MenuItem[] {
        const preferedOptions = getPreferedOptions();
        return preferedOptions.reduce((accumulator: MenuItem[], item: MenuItem) => {
            const invalidMinWidth = props.hasOwnProperty('minWidth') && item.width < props.minWidth;
            const invalidMaxWidth = props.hasOwnProperty('maxWidth') && item.width > props.maxWidth;
            const invalidMinLength = props.hasOwnProperty('minLength') && item.length < props.minLength;
            const invalidMaxLength = props.hasOwnProperty('maxLength') && item.length > props.maxLength;
            if (!invalidMinWidth && !invalidMaxWidth && !invalidMinLength && !invalidMaxLength) {
                accumulator.push(item);
            }
            return accumulator;
        }, []);
    }

    return (
        <div className="has-size-field">
            <PhotoSizeSelectSmall className="left-icon" fontSize="inherit" />
            {!customMode && (
                <FormControl fullWidth variant="outlined" size="small" error={props.error} onKeyDown={(event) => handleKeyDownSelect(event)}>
                    <Select
                        id={props.id}
                        classes={selectStyles}
                        inputProps={{
                            className: 'with-left-icon',
                        }}
                        MenuProps={{
                            // Bugfix: Disable vertical positioning to fix jumping behavior when changing to show all mode
                            getContentAnchorEl: null,
                        }}
                        onBlur={props.onBlur}
                        value={prepareValue()}
                        disabled={props.disabled}
                        displayEmpty={!!props.selectPlaceholder}
                        open={selectIsOpen}
                        onOpen={() => {
                            setSelectIsOpen(true);
                        }}
                        onClose={() => {
                            setSelectIsOpen(false);
                        }}
                        onChange={(event) => handleChangeSelect(event)}>
                        {props.selectPlaceholder && (
                            <MenuItem value="" disabled>{props.selectPlaceholder}</MenuItem>
                        )}
                        {options.map((menuItem, index) => (
                            <MenuItem key={index} value={menuItem.displayName}>
                                {menuItem.displayName}
                            </MenuItem>
                        ))}
                        {!showAllMode && (
                            <CustomMenuItem clickHandler={() => changeToShowAllMode()}>Show all...</CustomMenuItem>
                        )}
                        {props.allowCustomSize && (
                            <li><Divider></Divider></li>
                        )}
                        {props.allowCustomSize && (
                            <CustomMenuItem clickHandler={() => changeToCustomMode()}>{props.customPlaceholder + '...'}</CustomMenuItem>
                        )}
                    </Select>
                    <FormHelperText className="error-text" id={props.id + '-helper-text'}>{props.error ? props.errorText : props.selectHelpText}</FormHelperText>
                </FormControl>
            )}
            {customMode && (
                <div className="custom-mode">
                    <TextField
                        fullWidth
                        classes={textFieldStyles}
                        variant="outlined"
                        size="small"
                        error={props.error}
                        helperText={props.error ? props.errorText : props.customHelpText}
                        id={props.id}
                        placeholder={props.customPlaceholder}
                        autoFocus
                        inputProps={{
                            className: 'with-left-icon',
                        }}
                        value={customValue}
                        onChange={(event) => handleChangeCustom(event)}
                        onBlur={(event) => handleBlurCustom(event)}
                        disabled={props.disabled}
                    />
                    <CloseOutlined className="close-button" onClick={() => changeToSelectMode()} fontSize="small" />
                </div>
            )}
        </div>
    );

}

const useCustomMenuItemStyles = makeStyles({
    root: {
        padding: 0,
        display: 'block',
        height: 'auto',
    },
    content: {
        padding: '8px 16px',
        height: 24,
        boxSizing: 'content-box' as BoxSizingProperty,
        display: 'flex',
        alignItems: 'center',
    },
});

function CustomMenuItem(props): ReactElement {

    const styles = useCustomMenuItemStyles();

    return (
        <MenuItem className={styles.root}>
            <span className={styles.content} onClick={props.clickHandler}>{props.children}</span>
        </MenuItem>
    );

}
