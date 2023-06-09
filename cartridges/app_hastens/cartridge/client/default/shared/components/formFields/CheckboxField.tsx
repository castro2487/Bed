import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import './CheckboxField.scss';

interface Props {
    label: string;
    labelPlacement?: 'end' | 'start';
    checked: boolean;
    onChange: (value: boolean) => void;
}

export function CheckboxField({ checked, labelPlacement, label, onChange }: Props) {

    return (
        <FormControlLabel
            control={
                <Checkbox
                    color="default"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                />
            }
            labelPlacement={labelPlacement || 'end'}
            label={<span className={`has-checkbox`}>{label}</span>}
        />
    );
}
