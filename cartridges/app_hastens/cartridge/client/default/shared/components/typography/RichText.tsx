import './RichText.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';

interface Props {
    className?: string;
    children?: string;
}

export function RichText({ children, className }: Props): ReactElement {
    return (
        <div className={clsx('has-rich-text', className)} dangerouslySetInnerHTML={{ __html: children }}></div>
    );
}
