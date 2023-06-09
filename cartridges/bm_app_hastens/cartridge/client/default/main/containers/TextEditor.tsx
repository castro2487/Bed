import React, { ReactElement, useState } from 'react';
import { EditorProps } from '..';

interface EditorConfig {
    default_value: string;
}

export function TextEditor(props: EditorProps<EditorConfig>): ReactElement {
    const [value, setValue] = useState(null);
    const savedValue = props.value || props.config.default_value || '';

    return (
        <div className="slds-form-element">
            <textarea
                className="slds-textarea"
                disabled={props.disabled}
                value={value === null ? savedValue : value}
                onChange={(event) => {
                    setValue(event.target.value);
                    props.onChange(event.target.value);
                }}
            />
        </div>
    );
}
