import './ThemeEditor.scss';

import React, { ReactElement, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { options, optionStyles } from './options';
import { EditorProps } from '../..';

interface EditorConfig {
    default_value: string;
}

const useStyles = makeStyles(optionStyles);

export function ThemeEditor(props: EditorProps<EditorConfig>): ReactElement {
    const [selectedValue, setSelectedValue] = useState(null);
    const classes = useStyles();

    function isSelected(value) {
        if (selectedValue) {
            return value === selectedValue;
        } else if (props.value) {
            return value === props.value;
        }
        return value === props.config.default_value;
    }

    return (
        <div className="has-theme-editor">
            <ul>
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            disabled={props.disabled}
                            className={clsx({ 'selected': isSelected(option.value) })}
                            onClick={() => {
                                setSelectedValue(option.value);
                                props.onChange(option.value);
                            }}>
                            <span className={clsx('text', classes[option.value])}>{option.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
