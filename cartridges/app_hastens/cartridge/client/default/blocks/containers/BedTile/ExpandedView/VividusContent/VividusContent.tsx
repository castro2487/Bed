import './VividusContent.scss';

import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

import { CtaButtons } from '../DefaultContent/CtaButtons';
import { BedTileContent, ExpandedViewOrigin } from '../../helpers';
import { delay } from '../../../../../shared/helpers';
import { useServer } from '../../../../server/ServerProvider';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { InitialView } from '../../InitialView/InitialView';

interface Props {
    origin: ExpandedViewOrigin;
    initialHeight: number;
    onCloseView: () => void;
    onOpenDialog: () => void;
    onCloseDialog: () => void;
}

const Colors = lazy(() => import(/* webpackChunkName: "bed-tile-colors" */ '../DefaultContent/Colors/Colors'));

export function VividusContent(props: Props) {

    const { content, contentBlocks } = useServer<BedTileContent>();
    const rootRef = useRef<HTMLDivElement>();
    const [rootStyles, setRootStyles] = useState<CSSProperties>({ opacity: 0 });
    const [heightAfterRender, setHeightAfterRender] = useState<number>();
    const [animateInComplete, setAnimateInComplete] = useState(false);
    const [animateOutStarted, setAnimateOutStarted] = useState(false);
    const isAnimating = !animateInComplete || animateOutStarted;
    const isAnimatingRef = useRef(isAnimating);

    const colors = contentBlocks.find((block) => block.type === 'Colors');

    useEffect(() => {
        animateIn();
    }, []);

    useEffect(() => {
        isAnimatingRef.current = isAnimating;
    }, [isAnimating]);

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
        <div className="has-bed-tile__vividus" ref={rootRef} style={rootStyles}>
            <div className="column-1">
                <InitialView
                    onExpandButtonClick={() => {
                        // This code is sometimes triggered by an event handler so use a ref here instead of state
                        if (!isAnimatingRef.current) {
                            animateOut();
                            setTimeout(() => {
                                props.onCloseView();
                            }, 600);
                        }
                    }}
                    expandButtonText={content.text.close}
                    toggleState="compress"
                    ratio="10-6"
                />
                <div className="description-1">
                    <Paragraph size="sm" className="paragraph-1"><b>{content.description1}</b></Paragraph>
                    <Paragraph size="xs" className="paragraph-2">{content.description2}</Paragraph>
                </div>
            </div>
            <div className="column-2">
                <div className="inner-wrapper">
                    <div className="description-2">
                        <Paragraph size="xs">
                            <b>{content.text.weightLabel}: </b>{content.bedWeight || '-'}<br />
                            <b>{content.text.heightLabel}: </b>{content.bedHeight || '-'}<br />
                            {content.bedLayers && <><b>{content.text.numLayersLabel}: </b>{content.bedLayers}</>}
                        </Paragraph>
                        <Paragraph size="xs">{content.description3}</Paragraph>
                    </div>
                    <CtaButtons
                        activeBed={content.bed}
                        onOpenDialog={props.onOpenDialog}
                        onCloseDialog={props.onCloseDialog}
                    />
                    {(colors && colors.content.items.length) && (
                        <Suspense fallback={null}>
                            <Colors
                                items={colors.content.items}
                                onOpenDialog={props.onOpenDialog}
                                onCloseDialog={props.onCloseDialog}
                            />
                        </Suspense>
                    )}
                </div>
            </div>
        </div>
    );

}
