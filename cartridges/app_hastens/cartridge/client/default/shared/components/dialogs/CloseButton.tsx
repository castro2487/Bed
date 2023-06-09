import React, { ReactElement } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

interface Props {
    onClick: () => void;
    className?: string;
}

const useStyles = makeStyles(() => createStyles({
    root: {
        height: 30,
        width: 30,
        padding: 0,
        border: 0,
        backgroundColor: 'transparent',
        color: 'inherit',
        appearance: 'none',
        fontSize: 14,
    },
}));

export default function CloseButton(props: Props): ReactElement {
    const classes = useStyles();

    return (
        <button
            onClick={props.onClick}
            className={clsx(classes.root, props.className)}
            aria-label="Close dialog">
            <i className="fa fa-times" aria-hidden="true"></i>
        </button>
    );
}
