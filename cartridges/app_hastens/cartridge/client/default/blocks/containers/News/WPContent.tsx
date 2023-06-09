import React, { useRef, useEffect } from 'react';
import { useServer } from '../../server/ServerProvider';
import { NewsContent } from './News';

export interface Props {
    children: string;
}

const stylesheetUrls = [
    'https://production.backend.checkin.hastens.client.netconsult.cloud/app/themes/nc-hastens-pwa/dist/styles/fonts.css',
    'https://production.backend.checkin.hastens.client.netconsult.cloud/wp/wp-includes/css/dist/block-library/style.css',
    'https://production.backend.checkin.hastens.client.netconsult.cloud/wp/wp-includes/css/dist/block-library/theme.css',
    'https://production.backend.checkin.hastens.client.netconsult.cloud/app/themes/nc-hastens-pwa/dist/styles/main.css',
];

let stylePromise: Promise<string[]>;

export function WPContent(props: Props) {

    const server = useServer<NewsContent>();
    const dialogContentRef = useRef(null);

    useEffect(() => {
        lazyloadStylesheets().then((stylesheets) => {
            // Place content and styles in a shadowRoot so that the styles can't break anything outside the dialog
            createShadowRoot(dialogContentRef.current, props.children, stylesheets);
        });
    }, []);

    function lazyloadStylesheets(): Promise<string[]> {
        if (!stylePromise) {
            stylePromise = Promise.all(stylesheetUrls.map((style) => server.baseService.getFile(style)));
        }
        return stylePromise;
    }

    function createShadowRoot(element: HTMLDivElement, content: string, stylesheets: string[]) {
        const container = document.createElement('div');
        container.insertAdjacentHTML('beforeend', content);
        element.attachShadow({ mode: 'open' });
        element.shadowRoot.appendChild(container);
        stylesheets.forEach((stylesheet) => {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = stylesheet;
            element.shadowRoot.appendChild(styleElement);
        });
    }

    return <div ref={dialogContentRef}></div>;

}

export function WPContentFallback(props: Props) {

    const iframeRef = useRef(null);

    useEffect(() => {
        // As a fallback for IE 11 we use an iframe instead of a shadowRoot
        const container = document.createElement('div');
        container.insertAdjacentHTML('beforeend', props.children);
        iframeRef.current.contentWindow.document.body.appendChild(container);
        stylesheetUrls.forEach((stylesheetUrl) => {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = stylesheetUrl;
            iframeRef.current.contentWindow.document.head.appendChild(linkElement);
        });
    }, []);

    return (
        <iframe ref={iframeRef}></iframe>
    );

}
