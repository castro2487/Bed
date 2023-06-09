
import React, { ReactElement, useState } from 'react';
import { EditorProps } from '..';

interface EditorConfig {
    default_value: string;
    validateVideoLink: boolean;
}

export function StringEditor(props: EditorProps<EditorConfig>): ReactElement {
    const [value, setValue] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null);
    const savedValue = props.value || props.config.default_value || '';

    function updateValue(newValue: string) {
        setValue(newValue);
        props.onChange(newValue);
        if (props.config.validateVideoLink) {
            warnIfVideoLinkIsInvalid(newValue);
        }
    }

    function warnIfVideoLinkIsInvalid(newValueAsLink: string) {
        setWarningMessage(null);
        if (newValueAsLink === null) {
            return;
        }

        const video = document.createElement('video');
        video.onerror = () => setWarningMessage('Invalid video link');
        video.src = newValueAsLink;
    }


    return (
        <div className="slds-form-element">
            <input
                type="text"
                className="slds-input"
                disabled={props.disabled}
                value={value === null ? savedValue : value}
                onChange={(event) => {updateValue(event.target.value);}}
            />
            <p className="warning-message">{warningMessage}</p>
        </div>
    );
}
