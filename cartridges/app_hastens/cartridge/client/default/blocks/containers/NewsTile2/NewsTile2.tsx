import './NewsTile2.scss';

import React, { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { Image, Link, Theme, useServer } from '../../server/ServerProvider';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button, ButtonColor } from '../../../shared/components/formFields/Button';
import { hasImage, isIE } from '../../../shared/helpers';
import { Background } from '../../../shared/components/Background';
import { getButtonColor } from '../../../shared/muiTheme';

export interface NewsTile2Content {
    heading: string;
    excerpt: string;
    image: Image;
    imageHeading: string;
    imageBody: string;
    theme: Theme;
    buttonColor: ButtonColor;
    link: Link;
}

export function NewsTile2() {

    const { content, scaleWidthRecommendation } = useServer<NewsTile2Content>();
    const rootRef = useRef<HTMLDivElement>();
    const [imageTextFontSize, setImageTextFontSize] = useState<string>();

    useLayoutEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function handleResize() {
        const fontSize = `${rootRef.current.offsetWidth / 473 * 100}%`;
        setImageTextFontSize(fontSize);
    }

    return (
        <Background theme={content.theme} className={clsx('has-news-tile-2', { 'push-button-to-bottom': !isIE() })} ref={rootRef}>
            {hasImage(content.image) ? (
                <Background image={content.image} scaleWidth={scaleWidthRecommendation}>
                    <a className="image-spacer" href={content.link.url} tabIndex={-1} aria-hidden="true">
                        <div className="image-text" style={{ fontSize: imageTextFontSize }}>
                            <p className="image-heading">{content.imageHeading}</p>
                            <p className="image-body">{content.imageBody}</p>
                        </div>
                    </a>
                </Background>
            ) : (
                <a className="placeholder" href={content.link.url} tabIndex={-1} aria-hidden="true"></a>
            )}
            <div className="text">
                <h2 className="heading">{content.heading}</h2>
                <Paragraph size="sm" className="excerpt">{content.excerpt}</Paragraph>
                <Button
                    className="read-more-button"
                    size="medium"
                    color={content.buttonColor || getButtonColor(content.theme)}
                    href={content.link.url}>
                    <span className="sr-only">{content.heading}</span>
                    {content.link.text}
                </Button>
            </div>
        </Background>
    );

}
