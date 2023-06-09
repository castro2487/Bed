import './PlayButton.scss';

import React, { ReactElement } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import clsx from 'clsx';

interface Props {
    onClick?: (event) => void;
    pending?: boolean;
}

export function PlayButton(props: Props): ReactElement {

    return (
        <button
            className={clsx('has-play-button', { pending: props.pending })}
            disabled={props.pending}
            type="button"
            title="Play video"
            aria-disabled="false"
            onClick={props.onClick}>
            {props.pending && (
                <CircularProgress className="progress" size={20} thickness={6} color="inherit" />
            )}
        </button>
    );

}
