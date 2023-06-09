import React, { MouseEventHandler, PropsWithChildren, ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
    href: string;
    target?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const useStyles = makeStyles({
    root: {
        color: 'var(--has-link-color, #0071c1)',
        fontFamily: '"Montserrat SemiBold", sans-serif',
        '&:hover': {
            color: 'var(--has-link-color, #0071c1)',
            textDecoration: 'underline',
        },
    },
});

export default function Link(props: PropsWithChildren<Props>): ReactElement {
    const classes = useStyles();

    return (
        <a
            className={classes.root}
            href={props.href}
            target={props.target}
            rel={props.target === '_blank' ? 'noreferrer' : undefined}
            onClick={props.onClick}>
            {props.children}
            {props.target === '_blank' && (
                <span className="sr-only">(opens new window)</span>
            )}
        </a>
    );
}
