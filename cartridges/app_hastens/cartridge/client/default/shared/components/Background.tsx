import './Background.scss';

import React, { ReactElement, useRef, useEffect, useState, forwardRef, ReactNode } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import clsx from 'clsx';
import isObject from 'lodash/isObject';

import { Image, FocalPoint, ScaleWidth, Theme } from '../../blocks/server/ServerProvider';
import { getFullImageUrl } from '../helpers';

export interface Props {
    zoomable?: boolean;
    image?: Image;
    theme?: Theme;
    customTheme?: CustomTheme;
    size?: BackgroundSize;
    scaleWidth?: {
        mobile: ScaleWidth;
        tablet: ScaleWidth;
        desktop: ScaleWidth;
    } | boolean;
    className?: string;
    enableHighResolution?: boolean;
    children?: ReactNode;
}

interface CustomTheme {
    backgroundColor?: string;
    color?: string;
}

type BackgroundSize = 'cover' | 'contain' | 'full-width';
type Device = 'mobile' | 'tablet' | 'desktop';

export const Background = forwardRef(function Background(props: Props, ref: any): ReactElement {
    return (
        <div
            ref={ref}
            style={props.customTheme}
            className={clsx(
                'has-background',
                {
                    [`theme--${props.theme}`]: props.theme,
                    [`size--${props.size}`]: props.size,
                    'zoomable': props.zoomable,
                },
                props.className,
            )}>
            {props.image && ['mobile', 'tablet', 'desktop'].map((device) => {
                return !!props.image.sizes[device] && (
                    <BackgroundImage
                        key={device}
                        src={props.image.sizes[device].src}
                        focalPoint={props.image.sizes[device].focalPoint}
                        width={props.image.sizes[device].width}
                        height={props.image.sizes[device].height}
                        size={props.size}
                        device={device as Device}
                        scaleWidth={isObject(props.scaleWidth) ? props.scaleWidth[device] : props.scaleWidth}
                        enableHighResolution={props.enableHighResolution}
                    />
                );
            })}
            {(props.image && props.image.alt) && (
                <img className="hidden-image" src={props.image.sizes?.desktop?.src} alt={props.image.alt} />
            )}
            {props.children}
        </div>
    );
});

Background.defaultProps = {
    size: 'cover',
    scaleWidth: true,
    enableHighResolution: false,
};

function BackgroundImage(
    props: {
        src: string;
        focalPoint: FocalPoint;
        width: number;
        height: number;
        size: BackgroundSize;
        device: Device;
        scaleWidth: ScaleWidth | boolean;
        enableHighResolution: boolean;
    },
): ReactElement {

    const contentWidth = 1440;
    const fullWidthZeroPoint = '50%';
    const rootRef = useRef<HTMLDivElement>();
    const [fullWidthBackgroundPositionX, setFullWidthBackgroundPositionX] = useState<string>(fullWidthZeroPoint);
    const largerThanContent = useMediaQuery(`(min-width: ${contentWidth}px)`);
    const url = getFullImageUrl(props.src, props.scaleWidth, props.device, props.enableHighResolution);
    const shouldUseFullWidthBackgroundPosition = props.size === 'full-width' && props.device === 'desktop';
    const focalPointX = props.focalPoint?.x;
    const focalPointY = props.focalPoint?.y;
    const backgroundPositionX = focalPointX ? `${focalPointX}%` : null;
    const backgroundPositionY = focalPointY ? `${focalPointY}%` : null;

    useEffect(() => {
        if (shouldUseFullWidthBackgroundPosition) {
            calculateFullWidthBackgroundPosition();
        }
    }, [largerThanContent]); // TODO: Find a way to remove largerThanContent without breaking the functionality in the page designer

    // Full width backgrounds need a different method to set the focal point because the focal point needs to be relative to the content area
    function calculateFullWidthBackgroundPosition() {
        const elementHeight = rootRef.current.offsetHeight;
        const imageRatio = props.width / props.height;
        const imageWidth = elementHeight * imageRatio;
        const wiggleRoom = Math.abs((contentWidth - imageWidth) / 2);

        if (focalPointX > 50) {
            const offset = wiggleRoom * ((focalPointX - 50) / 50);
            setFullWidthBackgroundPositionX(`calc(${fullWidthZeroPoint} - ${offset}px)`);
        } else if (focalPointX < 50) {
            const offset = wiggleRoom * ((50 - focalPointX) / 50);
            setFullWidthBackgroundPositionX(`calc(${fullWidthZeroPoint} + ${offset}px)`);
        } else {
            setFullWidthBackgroundPositionX(fullWidthZeroPoint);
        }
    }

    return (
        <div
            ref={rootRef}
            className={`bg bg-${props.device}`}
            style={{
                backgroundImage: `url(${url.toString()})`,
                backgroundPositionX: shouldUseFullWidthBackgroundPosition ? fullWidthBackgroundPositionX : backgroundPositionX,
                backgroundPositionY,
            }}>
        </div>
    );

}
