import './ExpandButton.scss';

import React, { PropsWithChildren } from 'react';

interface Props {
    onClick: () => void;
    toggleState?: 'expand' | 'compress';
}

ExpandButton.defaultProps = {
    toggleState: 'expand',
};

export function ExpandButton(props: PropsWithChildren<Props>) {

    return (
        <button
            className="has-expand-button"
            onClick={props.onClick}>
            <i className={`icon toggle-state--${props.toggleState}`} aria-hidden="true"></i>
            <span className="text">{props.children}</span>
        </button>
    );

}
