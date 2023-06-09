import React, { ReactElement, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Reaptcha from 'reaptcha';
import clsx from 'clsx';

export interface RecaptchaFieldProps {
    onChange: (value) => void;
    size?: 'compact' | 'normal' | 'invisible';
}

RecaptchaField.defaultProps = {
    size: 'normal',
};

const useStyles = makeStyles({
    root: {
        minHeight: 78,
    },
});

export function RecaptchaField(props: RecaptchaFieldProps): ReactElement {
    const classes = useStyles();

    useEffect(() => {
        return () => {
            props.onChange('');
        };
    }, []);

    return (
        <div className={clsx('has-recaptcha-field', classes.root)}>
            <label className="sr-only" htmlFor="g-recaptcha-response">Recaptcha</label>
            <Reaptcha
                sitekey="6LcwixYTAAAAAOtZtyaAoxQTmwDysRUShw8rn-p5"
                size={props.size}
                onVerify={props.onChange}
                onExpire={() => {
                    props.onChange('');
                }}
            />
        </div>
    );

}
