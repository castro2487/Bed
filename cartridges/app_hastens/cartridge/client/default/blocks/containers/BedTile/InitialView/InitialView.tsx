import './InitialView.scss';

import React, { forwardRef, ReactElement, useEffect } from 'react';
import clsx from 'clsx';

import { Heading } from '../../../../shared/components/typography/Heading';
import { ExpandButton } from './ExpandButton';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { useServer } from '../../../server/ServerProvider';
import { beds, BedTileContent } from '../helpers';
import { Background } from '../../../../shared/components/Background';

interface Props {
    onExpandButtonClick: () => void;
    expandButtonText: string;
    toggleState: 'expand' | 'compress';
    ratio?: '10-7' | '10-6';
}

export const InitialView = forwardRef(function InitialView(props: Props, ref: any): ReactElement {

    const { content, scaleWidthRecommendation } = useServer<BedTileContent>();

    useEffect(() => {
        if (props.toggleState === 'compress') {
            window.addEventListener('hastens:expand-bedtile', handleExpandBedTile);
            window.addEventListener('keydown', handleWindowKeydown);
            return () => {
                window.removeEventListener('hastens:expand-bedtile', handleExpandBedTile);
                window.removeEventListener('keydown', handleWindowKeydown);
            };
        }
    }, []);

    function handleExpandBedTile() {
        // Close view when another view is opened
        props.onExpandButtonClick();
    }

    function handleWindowKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            props.onExpandButtonClick();
        }
    }

    return (
        <Background image={content.bedImage} scaleWidth={scaleWidthRecommendation} size="contain" theme="black-1">
            <div className={clsx('has-bed-tile__initial', { 'ratio--10-6': props.ratio === '10-6' })} ref={ref}>
                <div className="content-wrapper">
                    {content.bed === 'grandVividus' ? (
                        <h2 className="grand-vividus-heading">
                            <span className="sr-only">{beds[content.bed].name}</span>
                        </h2>
                    ) : (
                        <Heading
                            level={2}
                            size="sm"
                            className="heading">
                            <span className="small">Hästens</span>{'\n' + beds[content.bed].name}<sup aria-hidden="true">&reg;</sup>
                        </Heading>
                    )}
                    {content.subheading && <Paragraph className="initial-description">{content.subheading}</Paragraph>}
                    {content.subheading2 && <Paragraph size="xs" className="initial-description-2">{content.subheading2}</Paragraph>}
                    <ExpandButton
                        onClick={() => {
                            if (props.toggleState === 'expand') {
                                window.dispatchEvent(new Event('hastens:expand-bedtile'));
                            }
                            props.onExpandButtonClick();
                        }}
                        toggleState={props.toggleState}>
                        {props.expandButtonText}
                    </ExpandButton>
                </div>
            </div>
        </Background>
    );

});

InitialView.defaultProps = {
    ratio: '10-7',
} as Props;
