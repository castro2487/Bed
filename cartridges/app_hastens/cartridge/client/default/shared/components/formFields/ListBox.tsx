import React, { ReactType, ReactElement, useState } from 'react';
import clsx from 'clsx';

interface Props {
    id: string;
    options: any[];
    className: string;
    'aria-label': string;
    value: any;
    optionComponent: ReactType<ListBoxOptionProps>;
    onChange: (value) => void;
    valueKey?: string;
}

export interface ListBoxOptionProps<O = any> {
    option: O;
    isSelected: boolean;
}

/**
 * ListBox is a helper component we use when creating our own form controls
 */
export function ListBox(props: Props): ReactElement {

    const [focusedOption, setFocusedOption] = useState(-1);

    const OptionComponent = props.optionComponent;

    function isSelected(option): boolean {
        if (props.valueKey) {
            return option[props.valueKey] === props.value;
        } else {
            return option === props.value;
        }
    }

    function isFocused(index: number): boolean {
        return focusedOption === index;
    }

    function handleBlur() {
        setFocusedOption(-1);
    }

    function handleFocus() {
        const selectedOptionIndex = props.options.findIndex((option) => isSelected(option));
        if (selectedOptionIndex) {
            setFocusedOption(selectedOptionIndex);
        } else {
            setFocusedOption(0);
        }
    }

    function handleChange(option) {
        if (props.valueKey) {
            props.onChange(option[props.valueKey]);
        } else {
            props.onChange(option);
        }
    }

    function focusUp() {
        if (focusedOption === -1) {
            setFocusedOption(0);
        } else if (focusedOption > 0) {
            setFocusedOption(focusedOption - 1);
        }
    }

    function focusDown() {
        if (focusedOption < props.options.length - 1) {
            setFocusedOption(focusedOption + 1);
        }
    }

    return (
        <div
            className={clsx('listbox', props.className)}
            role="listbox"
            tabIndex={0}
            aria-label={props['aria-label']}
            aria-activedescendant={focusedOption !== -1 ? `${props.id}--option-${focusedOption}` : null}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(event) => {
                switch (event.keyCode) {
                    case 38: // Up
                        event.preventDefault();
                        focusUp();
                        break;
                    case 40: // Down
                        event.preventDefault();
                        focusDown();
                        break;
                    case 13: // Enter
                    case 32: // Space
                        event.preventDefault();
                        handleChange(props.options[focusedOption]);
                        break;
                }
            }}>
            {props.options.map((option, index) => (
                <div
                    key={index}
                    id={`${props.id}--option-${index}`}
                    className={clsx(
                        'listbox-option',
                        {
                            'selected': isSelected(option),
                            'focused': isFocused(index),
                        },
                    )}
                    role="option"
                    aria-selected={isSelected(option)}
                    onClick={() => {
                        setFocusedOption(index);
                        handleChange(option);
                    }}>
                    <OptionComponent
                        option={option}
                        isSelected={isSelected(option)}
                    />
                </div>
            ))}
        </div>
    );

}
