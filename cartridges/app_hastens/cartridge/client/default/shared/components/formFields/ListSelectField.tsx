import './ListSelectField.scss';

import React, { ReactElement, Fragment, useEffect } from 'react';
import Check from '@material-ui/icons/Check';

import { ListBox } from './ListBox';

export interface ListSelectFieldProps {
    id?: string;
    value: any;
    'aria-label'?: string;
    onChange: (value) => void;
    options: {
        label: string;
        value: string;
        avatar?: string;
    }[];
}

const Option = (props) => (
    <Fragment>
        {props.option.avatar && (
            <img src={props.option.avatar} />
        )}
        <span>{props.option.label}</span>
        {props.isSelected && (
            <Check fontSize="inherit" color="inherit" />
        )}
    </Fragment>
);

ListSelectField.defaultProps = {
    options: [],
};

export function ListSelectField(props: ListSelectFieldProps): ReactElement {

    useEffect(() => {
        if (props.options.length === 1) {
            props.onChange(props.options[0].value);
        }
    }, []);

    useEffect(() => {
        if (props.value) {
            const selectedMenuItem = props.options.find((menuItem) => menuItem.value === props.value);
            if (!selectedMenuItem) {
                props.onChange('');
            }
        }
    });

    return (
        <ListBox
            id={props.id}
            className="has-list-select-field"
            aria-label={props['aria-label']}
            value={props.value}
            options={props.options}
            optionComponent={Option}
            valueKey="value"
            onChange={(value) => {
                props.onChange(value);
            }}
        />
    );

}
