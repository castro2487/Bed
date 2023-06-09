import './ButtonColorEditor.scss';

import React, { ReactElement, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { options, optionStyles } from './options';
import { EditorProps } from '../..';

const useStyles = makeStyles(optionStyles);

export function ButtonColorEditor(props: EditorProps): ReactElement {
    const [selectedValue, setSelectedValue] = useState(null);
    const classes = useStyles();

    function isSelected(value) {
        if (selectedValue) {
            return value === selectedValue;
        }
        return value === props.value;
    }

    return (
        <div className="has-button-color-editor">
            <ul>
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            disabled={props.disabled}
                            className={clsx({ 'selected': isSelected(option.value) })}
                            onClick={() => {
                                if (isSelected(option.value)) {
                                    setSelectedValue(null);
                                    props.onChange(null);
                                } else {
                                    setSelectedValue(option.value);
                                    props.onChange(option.value);
                                }
                            }}>
                            <span className={clsx('text', classes[option.value])}>{option.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
