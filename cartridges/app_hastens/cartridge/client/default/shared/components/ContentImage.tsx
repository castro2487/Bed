import React, { ReactElement, PropsWithChildren } from 'react';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import isObject from 'lodash/isObject';

import { ImageSizes, ScaleWidth } from '../../blocks/server/ServerProvider';
import { getFullImageUrl } from '../helpers';

interface Props {
    sizes: ImageSizes;
    alt?: string;
    scaleWidth?: {
        mobile: ScaleWidth;
        tablet: ScaleWidth;
        desktop: ScaleWidth;
    } | boolean;
    className?: string;
}

type Device = 'mobile' | 'tablet' | 'desktop';

ContentImage.defaultProps = {
    scaleWidth: true,
    alt: '',
};

export function ContentImage(props: PropsWithChildren<Props>): ReactElement {

    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const tablet = useMediaQuery(theme.breakpoints.only('md'));
    const device = getDevice();
    const image = props.sizes[device];
    const scaleWidth = isObject(props.scaleWidth) ? props.scaleWidth[device] : props.scaleWidth;
    const url = getFullImageUrl(image.src, scaleWidth, device);

    function getDevice(): Device {
        if (mobile) {
            return 'mobile';
        } else if (tablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    return (
        <img
            className={props.className}
            src={url.toString()}
            alt={props.alt}
        />
    );

}
