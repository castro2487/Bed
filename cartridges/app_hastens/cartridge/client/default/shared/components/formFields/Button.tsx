import './Button.scss';

import React, { PropsWithChildren, ReactElement } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import pickBy from 'lodash/pickBy';
import clsx from 'clsx';
import pushState from '../../helpers/pushState';

export interface Props {
    appearance?: ButtonAppearance;
    color?: ButtonColor;
    size?: ButtonSize;
    pending?: boolean;
    disabled?: boolean;
    withArrow?: boolean;
    className?: string;
    onClick?: (event) => void;
    type?: 'submit' | 'reset' | 'button';
    href?: string;
    target?: string;
    disablePageReload?: boolean;
    tabIndex?: number;
}

type ButtonAppearance = 'standard' | 'simple' | 'outlined';

export type ButtonColor = 'primary' | 'secondary' | 'light' | 'dark';

export type ButtonSize = 'small' | 'medium' | 'large' | null;

Button.defaultProps = {
    appearance: 'standard',
    color: 'primary',
    size: 'large',
    pending: false,
    disablePageReload: false,
    target: null,
} as Props;

export function Button(props: PropsWithChildren<Props>): ReactElement {
    const { url, anchor } = getUrlAndAnchor();

    const ariaProps = pickBy(props, (value, key) => {
        return key.startsWith('aria-');
    });

    const Element = (() => {
        if (anchor && isSameUrl()) {
            return 'button';
        } else if (props.href !== undefined) {
            return 'a';
        } else if (props.onClick || props.type) {
            return 'button';
        } else {
            return 'div';
        }
    })();

    function getUrlAndAnchor(): { url: string; anchor: string; } {
        const linksObj = {
            url: null,
            anchor: null,
        };
        if (props.href) {
            const linksArr = props.href.split('#');
            linksObj.url = linksArr[0];
            linksObj.anchor = linksArr[1] || null;
        }
        return linksObj;
    }

    function handleClick(event) {
        if (anchor && isSameUrl()) {
            event.preventDefault();
            const targetElement = document.getElementById(anchor);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (props.disablePageReload) {
            event.preventDefault();
            pushState(props.href);
            window.scroll(0, 0);
        }
        if (props.onClick) {
            props.onClick(event);
        }
    }

    function isSameUrl(): boolean {
        if (!url) {
            return true;
        }
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(url);
        const endSlash = new RegExp(/\/$/);
        const isSameHost = currentUrl.host === targetUrl.host;
        const isSamePathname = currentUrl.pathname.replace(endSlash, '') === targetUrl.pathname.replace(endSlash, '');

        return isSameHost && isSamePathname;
    }

    return (
        <Element
            className={clsx(
                'has-button',
                {
                    'color--primary': props.color === 'primary',
                    'color--secondary': props.color === 'secondary',
                    'color--light': props.color === 'light',
                    'color--dark': props.color === 'dark',
                    'appearance--standard': props.appearance === 'standard' || props.appearance === null,
                    'appearance--simple': props.appearance === 'simple',
                    'appearance--outlined': props.appearance === 'outlined',
                    'pending': props.pending,
                    'with-arrow': (url && props.withArrow !== false) || props.withArrow === true,
                    'should-animate-arrow': props.appearance === 'simple',
                    'size--small': props.size === 'small',
                    'size--medium': props.size === 'medium',
                    'size--large': props.size === 'large',
                },
                props.className,
            )}
            tabIndex={props.tabIndex}
            type={props.type}
            href={Element === 'a' ? props.href : undefined}
            target={props.target}
            onClick={handleClick}
            disabled={props.disabled || props.pending}
            {...ariaProps}>
            {Boolean(props.children) && (
                <span className="text">{props.children}</span>
            )}
            {props.pending && (
                <CircularProgress className="circular-progress" size={20} thickness={6} color="inherit" />
            )}
        </Element>
    );

}
