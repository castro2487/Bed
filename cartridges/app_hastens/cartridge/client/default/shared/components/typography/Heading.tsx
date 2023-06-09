import './Heading.scss';

import React, { ReactElement, PropsWithChildren } from 'react';
import clsx from 'clsx';

export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
interface Props {
    className?: string;
    level?: 1 | 2 | 3 | 4 | 5;
    size?: HeadingSize;
}

Heading.defaultProps = {
    level: 1,
    size: 'md',
};

export function Heading({ className, children, size, level }: PropsWithChildren<Props>): ReactElement {

    return React.createElement(
        `h${level}`,
        { className: clsx('has-heading', `size--${size}`, className) },
        children,
    );
}
