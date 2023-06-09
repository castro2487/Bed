import React, { useState, ReactElement, useRef, useEffect, isValidElement } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import isArray from 'lodash/isArray';

import { usePrevious, delay, shouldScrollIntoView, scrollIntoView } from '../helpers';

interface Props {
    index: number;
    children: ReactElement | ReactElement[];
    className: string;
}

AnimatedSteps.defaultProps = {
    index: 0,
    children: [],
} as Props;

const useStyles = makeStyles(() => createStyles({
    child: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
    },
}));

export const fadeDuration = 200;
export const collapseDuration = 400;

export default function AnimatedSteps(props: Props): ReactElement {
    const classes = useStyles();
    const rootRef = useRef<HTMLDivElement>();
    const childRefs = useRef<{ [index: string]: HTMLDivElement }>({});
    const prevIndex = usePrevious(props.index);
    const [rootStyles, setRootStyles] = useState<CSSProperties>({});
    const [childStyles, setChildStyles] = useState<{ [index: string]: CSSProperties }>({});
    const [completedIndex, setCompletedIndex] = useState<number>();
    const validChildren = (isArray(props.children) ? props.children : [props.children]).filter(isValidElement);

    useEffect(() => {
        setChildStyles(() => {
            return Object.keys(childRefs.current).reduce<any>((prevValue, currValue) => {
                if (currValue === props.index.toString()) {
                    prevValue[currValue] = {
                        opacity: 1,
                        height: 'auto',
                        overflow: 'visible',
                    };
                }
                return prevValue;
            }, {});
        });
    }, []);

    useEffect(() => {
        if (prevIndex === undefined) {
            return;
        }
        if (shouldScrollIntoView(rootRef.current)) {
            scrollIntoView(rootRef.current).then(() => {
                animate();
            });
        } else {
            animate();
        }
    }, [props.index]);

    function animate(): Promise<void> {
        return Promise.resolve()
            .then(() => {
                setRootStyles({
                    height: getElementHeight(prevIndex),
                });
                setChildStyles(() => {
                    return Object.keys(childRefs.current).reduce<any>((prevValue, currValue) => {
                        if (currValue === prevIndex.toString()) {
                            prevValue[currValue] = {
                                transition: `opacity ${fadeDuration}ms`,
                                opacity: 0,
                                height: 'auto',
                                overflow: 'visible',
                            };
                        }
                        return prevValue;
                    }, {});
                });
            })
            .then(() => {
                if (getElementHeight(prevIndex) > 0) {
                    return delay(fadeDuration);
                }
                // If the previous element doesn't have a height we don't need to wait for the fade animation
                // but we do want a small delay for setting the height of the root element in the state
                return delay(10);
            })
            .then(() => {
                setRootStyles({
                    transition: `height ${collapseDuration}ms`,
                    height: getElementHeight(props.index),
                });
                setChildStyles(() => {
                    return Object.keys(childRefs.current).reduce<any>((prevValue, currValue) => {
                        if (currValue === props.index.toString()) {
                            prevValue[currValue] = {
                                height: 'auto',
                                overflow: 'visible',
                            };
                        }
                        return prevValue;
                    }, {});
                });
            })
            .then(() => delay(collapseDuration))
            .then(() => {
                setRootStyles({});
                setChildStyles(() => {
                    return Object.keys(childRefs.current).reduce<any>((prevValue, currValue) => {
                        if (currValue === props.index.toString()) {
                            prevValue[currValue] = {
                                transition: `opacity ${fadeDuration}ms`,
                                opacity: 1,
                                height: 'auto',
                                overflow: 'visible',
                            };
                        }
                        return prevValue;
                    }, {});
                });
            })
            .then(() => delay(fadeDuration))
            .then(() => {
                setCompletedIndex(props.index);
            });
    }

    function getElementHeight(index: number): number {
        const element = childRefs.current[index] as HTMLDivElement;
        if (!element) {
            return 0;
        }
        const contentElement = element.children[0] as HTMLElement;
        return contentElement.offsetHeight;
    }

    return (
        <div ref={rootRef} style={rootStyles} className={props.className}>
            {validChildren.map((child, childIndex) => {
                const visible = childIndex === props.index || (childIndex === prevIndex && completedIndex !== props.index);

                if (!visible) {
                    return null;
                }

                return (
                    <div
                        key={childIndex}
                        ref={(ref) => {
                            childRefs.current[childIndex] = ref;
                        }}
                        className={classes.child}
                        style={childStyles[childIndex]}>
                        <div>{child}</div>
                    </div>
                );
            })}
        </div>
    );
}
