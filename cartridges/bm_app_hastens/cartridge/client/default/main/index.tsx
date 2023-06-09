/*
@Todo
 Potential BUG:
 There is an unexpected behavior when sfcc tutorial is followed regarding emitting data on 'custom input attribute'
 emit({
    type: 'sfcc:value',
    payload: value ? { value } : null, // when null is returned an error is thrown.
});
*/

import './styles/main.scss';

import React, { useEffect, useState, ReactElement } from 'react';
import { render } from 'react-dom';

import * as components from './exports';

export interface EditorProps<C = void> {
    value: any;
    config: {
        type: string;
    } & C;
    disabled: boolean;
    onChange: (value) => void;
}

subscribe('sfcc:ready', ({ value, config, isRequired, isDisabled }) => {

    const element = document.createElement('div');
    document.body.appendChild(element);

    render(
        <Editor
            config={config}
            defaultValue={value}
            defaultDisabled={isDisabled}
            required={isRequired}
        />,
        element,
    );

});

function Editor({ config, defaultValue, defaultDisabled, required }): ReactElement {

    const [disabled, setDisabled] = useState(defaultDisabled);
    const Component = components[config.type];

    useEffect(() => {
        subscribe('sfcc:disabled', (nextDisabled) => {
            setDisabled(nextDisabled);
        });
    }, []);

    function getValue() {
        const savedValue = defaultValue ? defaultValue.value : null;
        return savedValue || null;
    }

    return (
        <Component
            value={getValue()}
            config={config}
            disabled={disabled}
            onChange={(nextValue) => {
                emit({
                    type: 'sfcc:value',
                    payload: nextValue ? { value: nextValue } : (required ? ' ' : {}),
                });
            }}
        />
    );
}
