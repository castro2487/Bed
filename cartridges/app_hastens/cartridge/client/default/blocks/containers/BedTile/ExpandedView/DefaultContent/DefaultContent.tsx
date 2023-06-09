import './DefaultContent.scss';

import React, { lazy, Suspense } from 'react';

import { AnimatedContainer } from './AnimatedContainer';
import { CtaButtons } from './CtaButtons';
import { BedDescription } from './BedDescription';
import { CutThroughImage } from './CutThroughImage';
import { InformationTable } from './InformationTable';
import { beds, BedTileContent, ExpandedViewOrigin } from '../../helpers';
import { useServer } from '../../../../server/ServerProvider';

interface Props {
    origin: ExpandedViewOrigin;
    initialHeight: number;
    onCloseView: () => void;
    onOpenDialog: () => void;
    onCloseDialog: () => void;
}

const Colors = lazy(() => import(/* webpackChunkName: "bed-tile-colors" */ './Colors/Colors'));

export function DefaultContent(props: Props) {

    const { content: { bed }, contentBlocks } = useServer<BedTileContent>();
    const colors = contentBlocks.find((block) => block.type === 'Colors');
    const informationTable = contentBlocks.find((block) => block.type === 'InformationTable');

    return (
        <div className="has-bed-tile__default-content">
            <AnimatedContainer
                initialHeight={props.initialHeight}
                origin={props.origin}
                onCloseView={props.onCloseView}
                slot1={
                    <BedDescription />
                }
                slot2={
                    <div className="right-side">
                        <div className="section-1">
                            <CtaButtons
                                activeBed={bed}
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
                            <CutThroughImage
                                bed={beds[bed].name}
                                image={beds[bed].cutThroughImg}
                            />
                        </div>
                        <div className="section-2">
                            {informationTable && (
                                <InformationTable content={informationTable.content.content} text={informationTable.content.text} />
                            )}
                        </div>
                    </div>
                }
            />
        </div>
    );

}
