import React, { cloneElement, forwardRef, PropsWithChildren, ReactElement } from 'react';
import { Transition } from 'react-transition-group';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: (props: any) => ({
        transition: [
            theme.transitions.create('opacity', {
                duration: props.timeout,
            }),
            theme.transitions.create('transform', {
                duration: props.timeout * 0.666,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }),
        ].join(','),
    }),
    entering: {
        opacity: 1,
        transform: 'scale(1, 1)',
    },
    entered: {
        opacity: 1,
    },
    exiting: {
        opacity: 0,
    },
    exited: {
        opacity: 0,
        transform: 'scale(0.75, 0.5625)',
    },
}));

const DialogAnimation: any = forwardRef(function DialogAnimationWithRef(props: PropsWithChildren<any>, ref): ReactElement {
    const classes = useStyles(props);

    return (
        <Transition
            in={props.in}
            appear={props.appear}
            timeout={props.timeout}
            onEnter={props.onEnter}
            onEntering={props.onEntering}
            onEntered={props.onEntered}
            onExit={props.onExit}
            onExiting={props.onExiting}
            onExited={props.onExited}>
            {(state) => cloneElement(props.children, {
                ref,
                role: props.role,
                tabIndex: props.tabIndex,
                className: clsx(props.children.props.className, classes.root, classes[state]),
            })}
        </Transition>
    );
});

export default DialogAnimation;
