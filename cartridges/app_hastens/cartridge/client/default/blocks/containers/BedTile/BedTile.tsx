import './BedTile.scss';

import React, { useEffect, useRef, useState } from 'react';
import Fade from '@material-ui/core/Fade';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import { InitialView } from './InitialView/InitialView';
import { ExpandedView } from './ExpandedView/ExpandedView';
import { useServer } from '../../server/ServerProvider';
import { BedTileContent, calculateOrigin, ExpandedViewOrigin } from './helpers';
import { scrollIntoView } from '../../../shared/helpers';
import { lightTheme } from '../../../shared/muiTheme';

export function BedTile() {

    const server = useServer<BedTileContent>();
    const rootRef = useRef<HTMLDivElement>();
    const initialViewRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);
    const [expandedViewOrigin, setExpandedViewOrigin] = useState<ExpandedViewOrigin>('left-top');
    const [initialHeight, setInitialHeight] = useState<number>();

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        if (window.location.hash.substr(1) === server.blockId) {
            handleOpenExpandedView();
        }
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function handleOpenExpandedView() {
        handleResize();
        scrollIntoView(rootRef.current).then(() => {
            setExpanded(true);
            setLocationHash();
        });
    }

    function handleCloseExpandedView() {
        setExpanded(false);
        resetLocationHashWithoutRefresh();
    }

    function setLocationHash() {
        window.location.hash = `#${server.blockId}`;
    }

    function resetLocationHashWithoutRefresh() {
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    function handleResize() {
        if (server.parentId) {
            recalculate(rootRef.current, document.querySelector(`#${server.parentId}`));
        } else {
            recalculate(rootRef.current, document.body);
        }
        setInitialHeight(initialViewRef.current.offsetHeight);
    }

    function recalculate(element: HTMLElement, boundingElement: HTMLElement) {
        const elementRect = element.getBoundingClientRect();
        const boundingElementRect = boundingElement.getBoundingClientRect();
        const blockSpacing = 10; // TODO: Should be dynamic
        const nextExpandedViewOrigin = calculateOrigin(elementRect, boundingElementRect, blockSpacing);

        setExpandedViewOrigin(nextExpandedViewOrigin);
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <div className="has-bed-tile" ref={rootRef}>
                <InitialView
                    ref={initialViewRef}
                    onExpandButtonClick={handleOpenExpandedView}
                    expandButtonText={server.content.text.showMore}
                    toggleState="expand"
                />
                <Fade in={expanded} timeout={600} unmountOnExit appear>
                    <ExpandedView
                        onCloseView={handleCloseExpandedView}
                        origin={expandedViewOrigin}
                        initialHeight={initialHeight}
                    />
                </Fade>
            </div>
        </ThemeProvider>
    );

}
