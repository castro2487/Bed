import './GrandVividusContent.scss';

import React, { useEffect, useRef, useState } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

import { beds, BedTileContent } from '../../helpers';
import { delay } from '../../../../../shared/helpers';
import { useServer } from '../../../../server/ServerProvider';
import { Background } from '../../../../../shared/components/Background';
import { Button } from '../../../../../shared/components/formFields/Button';

interface Props {
    initialHeight: number;
    onCloseView: () => void;
}

export function GrandVividusContent(props: Props) {

    const { content } = useServer<BedTileContent>();
    const rootRef = useRef<HTMLDivElement>();
    const [rootStyles, setRootStyles] = useState<CSSProperties>({ opacity: 0 });
    const [heightAfterRender, setHeightAfterRender] = useState<number>();
    const [animateInComplete, setAnimateInComplete] = useState(false);
    const [animateOutStarted, setAnimateOutStarted] = useState(false);

    useEffect(() => {
        animateIn();
    }, []);

    useEffect(() => {
        setRootStyles({ height: heightAfterRender, opacity: 0 });
    }, [heightAfterRender]);

    function animateIn() {
        let targetHeight;

        Promise.resolve()
            .then(() => {
                targetHeight = rootRef.current.offsetHeight;
                setRootStyles({ height: props.initialHeight, opacity: 0 });
            })
            .then(() => delay(600))
            .then(() => {
                setRootStyles({ height: targetHeight, opacity: 1 });
            })
            .then(() => delay(600))
            .then(() => {
                setRootStyles({});
                setAnimateInComplete(true);
            });
    }

    function animateOut() {
        setAnimateOutStarted(true);
        setRootStyles({ height: rootRef.current.offsetHeight, opacity: 1 });
        // TODO: Is there a better way to change the state after render?
        setHeightAfterRender(props.initialHeight);
    }

    return (
        <div className="has-bed-tile__grand-vividus" ref={rootRef} style={rootStyles}>
            <div className="inner-wrapper">
                <div className="content-wrapper">
                    <h2 className="heading">
                        <span className="sr-only">{beds[content.bed].name}</span>
                    </h2>
                    <div className="button-wrapper">
                        <Button color="light" href={content.link.url}>{content.link.text}</Button>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (animateInComplete && !animateOutStarted) {
                            animateOut();
                            setTimeout(() => {
                                props.onCloseView();
                            }, 600);
                        }
                    }}
                    className="close-button"
                    aria-label="Close dialog">
                    <span className="fa fa-times"></span>
                </button>
                <Background className="bed-image" image={content.bedImage} theme="black-1" size="contain"></Background>
            </div>
        </div>
    );

}
