import './AnimatedContainer.scss';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

import { InitialView } from '../../InitialView/InitialView';
import { useServer } from '../../../../server/ServerProvider';
import { BedTileContent, ExpandedViewOrigin } from '../../helpers';
import { delay } from '../../../../../shared/helpers';

interface Props {
    slot1: ReactElement;
    slot2: ReactElement;
    origin: ExpandedViewOrigin;
    initialHeight: number;
    onCloseView: () => void;
}

export function AnimatedContainer(props: Props) {

    const { content } = useServer<BedTileContent>();

    const rootRef = useRef<HTMLDivElement>();
    const col1Ref = useRef<HTMLDivElement>();
    const col2Ref = useRef<HTMLDivElement>();
    const [rootStyles, setRootStyles] = useState<CSSProperties>({});
    const [col1Styles, setCol1Styles] = useState<CSSProperties>({});
    const [col2Styles, setCol2Styles] = useState<CSSProperties>({});
    const [slot2Styles, setSlot2Styles] = useState<CSSProperties>({ opacity: 0 });
    const [slot3Styles, setSlot3Styles] = useState<CSSProperties>({ opacity: 0 });
    const [animateInComplete, setAnimateInComplete] = useState(false);
    const [animateOutStarted, setAnimateOutStarted] = useState(false);
    const isAnimating = !animateInComplete || animateOutStarted;
    const isAnimatingRef = useRef(isAnimating);

    useEffect(() => {
        animateIn();
    }, []);

    useEffect(() => {
        isAnimatingRef.current = isAnimating;
    }, [isAnimating]);

    function animateIn() {
        let targetHeight;

        if (shouldSlide()) {
            Promise.resolve()
                .then(() => {
                    targetHeight = rootRef.current.offsetHeight;
                    setRootStyles({ height: props.initialHeight });
                    setCol1Styles({ position: 'absolute', right: 0 });
                    setCol2Styles({ position: 'absolute', left: 0 });
                })
                .then(() => delay(300))
                .then(() => {
                    setCol1Styles({ position: 'absolute', right: '50%' });
                    setCol2Styles({ position: 'absolute', left: '50%' });
                    setRootStyles({ height: targetHeight });
                })
                .then(() => delay(600))
                .then(() => {
                    setCol1Styles({});
                    setCol2Styles({});
                    setRootStyles({});
                    setSlot2Styles({ opacity: 1 });
                    setSlot3Styles({ opacity: 1 });
                })
                .then(() => delay(600))
                .then(() => {
                    setSlot2Styles({});
                    setSlot3Styles({});
                    setAnimateInComplete(true);
                });
        } else {
            Promise.resolve()
                .then(() => {
                    targetHeight = rootRef.current.offsetHeight;
                    setRootStyles({ height: props.initialHeight });
                })
                .then(() => delay(300))
                .then(() => {
                    setRootStyles({ height: targetHeight });
                })
                .then(() => delay(600))
                .then(() => {
                    setSlot2Styles({ opacity: 1 });
                    setSlot3Styles({ opacity: 1 });
                    setRootStyles({});
                })
                .then(() => delay(600))
                .then(() => {
                    setSlot2Styles({});
                    setSlot3Styles({});
                    setAnimateInComplete(true);
                });
        }
    }

    function animateOut() {
        setAnimateOutStarted(true);

        if (shouldSlide()) {
            Promise.resolve()
                .then(() => {
                    setSlot2Styles({ opacity: 0 });
                    setSlot3Styles({ opacity: 0 });
                    setRootStyles({ height: rootRef.current.offsetHeight });
                    setCol1Styles({ position: 'absolute', right: '50%' });
                    setCol2Styles({ position: 'absolute', left: '50%' });
                })
                .then(() => delay(600))
                .then(() => {
                    setRootStyles({ height: props.initialHeight });
                    setCol1Styles({ position: 'absolute', right: 0 });
                    setCol2Styles({ position: 'absolute', left: 0 });
                });
        } else {
            Promise.resolve()
                .then(() => {
                    setSlot2Styles({ opacity: 0 });
                    setSlot3Styles({ opacity: 0 });
                    setRootStyles({ height: rootRef.current.offsetHeight });
                })
                .then(() => delay(600))
                .then(() => {
                    setRootStyles({ height: props.initialHeight });
                });
        }

    }

    function shouldSlide(): boolean {
        const col1 = col1Ref.current.getBoundingClientRect();
        const col2 = col2Ref.current.getBoundingClientRect();
        return props.origin === 'right-top' && col1.top === col2.top;
    }

    return (
        <div
            ref={rootRef}
            className="has-bed-tile__animated-container"
            style={rootStyles}>
            <div className="column-1" ref={col1Ref} style={col1Styles}>
                <div className="slot-1">
                    <InitialView
                        onExpandButtonClick={() => {
                            // This code is sometimes triggered by an event handler so use a ref here instead of state
                            if (!isAnimatingRef.current) {
                                animateOut();
                                setTimeout(() => {
                                    props.onCloseView();
                                }, 1200);
                            }
                        }}
                        expandButtonText={content.text.close}
                        toggleState="compress"
                    />
                </div>
                <div className="slot-2" style={slot2Styles}>
                    {props.slot1}
                </div>
            </div>
            <div className="column-2" ref={col2Ref} style={col2Styles}>
                <div className="slot-3" style={slot3Styles}>
                    {props.slot2}
                </div>
            </div>
        </div>
    );

}
