// This component uses styles from
// https://cdnjs.cloudflare.com/ajax/libs/design-system/2.8.3/styles/salesforce-lightning-design-system.min.css

import React, { ReactElement, useState } from 'react';
import { EditorProps } from '..';

interface EditorConfig {
    default_value: string;
    options: {
        value: any;
        name: string;
    }[];
}

export function SelectEditor(props: EditorProps<EditorConfig>): ReactElement {
    const [selectedValue, setSelectedValue] = useState('');
    const savedValue = props.value || props.config.default_value || '';

    return (
        <div className="slds-select_container">
            <select
                className="slds-select"
                disabled={props.disabled}
                value={selectedValue ? selectedValue : savedValue}
                onChange={(event) => {
                    setSelectedValue(event.target.value);
                    props.onChange(event.target.value);
                }}>
                <option value="">Select an Option</option>
                {props.config.options.map((option, index) => (
                    <option key={index} value={option.value}>{option.name}</option>
                ))}
            </select>
        </div>
    );
}
