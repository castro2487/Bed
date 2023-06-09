import React, { ReactElement } from 'react';
import MuiSnackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { montserratFontFamily } from '../muiTheme';

interface Props {
    open: boolean;
    onClose: () => void;
    message?: string;
    severity?: 'success' | 'error';
}

const useAlertStyles = makeStyles({
    root: {
        borderRadius: 0,
        fontFamily: montserratFontFamily,
    },
});

const defaultMessage = {
    success: '',
    error: 'An error occured!',
};

Snackbar.defaultProps = {
    open: false,
    severity: 'success',
} as Props;

export function Snackbar(props: Props): ReactElement {

    const alertStyles = useAlertStyles();

    return (
        <MuiSnackbar
            open={props.open}
            autoHideDuration={props.severity === 'success' ? 10000 : null}>
            <Alert
                classes={alertStyles}
                variant="filled"
                severity={props.severity}
                elevation={6}
                onClose={props.onClose}>
                {props.message || defaultMessage[props.severity]}
            </Alert>
        </MuiSnackbar>
    );

}
