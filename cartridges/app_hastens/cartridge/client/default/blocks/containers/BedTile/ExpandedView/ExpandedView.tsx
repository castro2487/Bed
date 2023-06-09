import './ExpandedView.scss';

import React, { useEffect, useState } from 'react';
import TrapFocus from '@material-ui/core/Unstable_TrapFocus';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { BedTileContent, ExpandedViewOrigin } from '../helpers';
import { useServer } from '../../../server/ServerProvider';
import { DefaultContent } from './DefaultContent/DefaultContent';
import { GrandVividusContent } from './GrandVividusContent/GrandVividusContent';
import { VividusContent } from './VividusContent/VividusContent';

interface Props {
    origin: ExpandedViewOrigin;
    style?: CSSProperties;
    initialHeight: number;
    onCloseView: () => void;
}

export function ExpandedView(props: Props) {

    const { content } = useServer<BedTileContent>();

    // This value is used to deactivate TrapFocus when the mouse is used to prevent jumping behaviour
    const [mousemoveIsActive, setMousemoveIsActive] = useState(false);
    // This value is used to deactivate TrapFocus when a dialog is opened to prevent two TrapFocus being active at the same time
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    useEffect(() => {
        window.addEventListener('mousemove', handleWindowMousemove);
        window.addEventListener('keydown', handleWindowKeydown);

        return () => {
            window.removeEventListener('mousemove', handleWindowMousemove);
            window.removeEventListener('keydown', handleWindowKeydown);
        };
    }, []);

    function handleWindowMousemove() {
        setMousemoveIsActive(true);
    }

    function handleWindowKeydown() {
        setMousemoveIsActive(false);
    }

    function renderContent() {
        switch (content.bed) {
            case 'grandVividus': {
                return (
                    <GrandVividusContent
                        initialHeight={props.initialHeight}
                        onCloseView={props.onCloseView}
                    />
                );
            }
            case 'vividus':
            case 'adjustable': {
                return (
                    <VividusContent
                        origin={props.origin}
                        initialHeight={props.initialHeight}
                        onCloseView={props.onCloseView}
                        onOpenDialog={() => {setDialogIsOpen(true);}}
                        onCloseDialog={() => {setDialogIsOpen(false);}}
                    />
                );
            }
            default: {
                return (
                    <DefaultContent
                        origin={props.origin}
                        initialHeight={props.initialHeight}
                        onCloseView={props.onCloseView}
                        onOpenDialog={() => {setDialogIsOpen(true);}}
                        onCloseDialog={() => {setDialogIsOpen(false);}}
                    />
                );
            }
        }
    }

    return (
        <div
            onClick={(event) => {
                event.stopPropagation();
            }}
            className={clsx([
                'has-bed-tile__expanded',
                props.origin ? `origin--${props.origin}` : 'origin--fallback',
            ])}
            style={props.style}>
            <TrapFocus open={!mousemoveIsActive && !dialogIsOpen} isEnabled={() => true} getDoc={() => document}>
                <div role="presentation" tabIndex={-1}>
                    {renderContent()}
                </div>
            </TrapFocus>
        </div>
    );

}
