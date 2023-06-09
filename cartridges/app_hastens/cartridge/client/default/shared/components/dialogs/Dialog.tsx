import React, { PropsWithChildren, ReactElement } from 'react';
import MuiDialog from '@material-ui/core/Dialog';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';

import DialogAnimation from './DialogAnimation';
import CloseButton from './CloseButton';

interface Props {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'fullScreen' | false;
    open: boolean;
    theme?: 'light' | 'dark';
    hideCloseButton?: boolean;
    disableBackdropClick?: boolean;
    onClose: () => void;
    onExit?: () => void;
    onExited?: () => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    paperSizeSm: {
        width: 576,
    },
    paperSizeMd: {
        width: 1380,
    },
    paperSizeLg: {
        width: 1555,
    },
    fullScreen: {
        margin: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        [theme.breakpoints.up('sm')]: {
            top: 20,
            right: 20,
        },
    },
    darkMode: {
        backgroundColor: '#000',
        color: '#fff',
    },
}));

Dialog.defaultProps = {
    size: 'md',
    hideCloseButton: false,
    disableBackdropClick: false,
};

export default function Dialog(props: PropsWithChildren<Props>): ReactElement {
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <MuiDialog
            className={props.className}
            classes={{
                paper: clsx({
                    [classes.paperSizeSm]: props.size === 'sm',
                    [classes.paperSizeMd]: props.size === 'md',
                    [classes.paperSizeLg]: props.size === 'lg',
                    [classes.fullScreen]: props.size === 'fullScreen' || isMobile,
                    [classes.darkMode]: props.theme === 'dark',
                }),
            }}
            PaperProps={{
                square: true,
            }}
            maxWidth={false}
            disableBackdropClick={props.disableBackdropClick}
            TransitionComponent={DialogAnimation}
            transitionDuration={800}
            open={props.open}
            onClose={props.onClose}
            onExit={props.onExit}
            onExited={props.onExited}>
            {!props.hideCloseButton && (
                <CloseButton
                    className={classes.closeButton}
                    onClick={() => {
                        if (props.onClose) {
                            props.onClose();
                        }
                    }}
                />
            )}
            {props.children}
        </MuiDialog>
    );
}
