import './Paragraph.scss';

import React, { ReactElement, PropsWithChildren, Fragment } from 'react';
import clsx from 'clsx';

interface Props {
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    dangerouslySetInnerHTML?: {__html: string};
}

Paragraph.defaultProps = {
    size: 'md',
    title: null,
};

export function Paragraph(props: PropsWithChildren<Props>): ReactElement {
    return (
        <p
            title={props.title}
            className={clsx('has-paragraph', `size--${props.size}`, props.className)}
            dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}>
            {props.dangerouslySetInnerHTML ? null : props.children}
        </p>
    );
}

export function makeParagraphs(plainText: string, props?: Props): ReactElement {
    const paragraphs = (plainText || '').split('\n').filter((item) => !!item);

    return (
        <Fragment>
            {paragraphs.map((paragraph, index) => (
                <Paragraph key={index} {...props}>{paragraph}</Paragraph>
            ))}
        </Fragment>
    );
}
