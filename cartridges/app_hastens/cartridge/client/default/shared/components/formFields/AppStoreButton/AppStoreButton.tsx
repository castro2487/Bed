import './AppStoreButton.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';
import { AppleBlackSvg } from './AppleBlackSvg';
import { AppleWhiteSvg } from './AppleWhiteSvg';

interface Props {
    href: string;
    theme: 'dark' | 'light';
    size?: 'medium' | 'large';
}

AppStoreButton.defaultProps = {
    size: 'medium',
};

export function AppStoreButton({ href, theme, size }: Props): ReactElement {
    return (
        <a href={href} target="_blank" rel="noreferrer" className={clsx('has-app-store-button', `size--${size}`)} aria-label="Download on the App Store (opens new window)">
            {theme === 'dark' ? <AppleWhiteSvg /> : <AppleBlackSvg />}
        </a>
    );
}
