import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import './PartnerPageDescription.scss';
import { Image, Theme, useServer } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import { RichText } from '../../../shared/components/typography/RichText';

interface PartnerPageDescriptionContent {
    store: {
        description: string;
        theme: Theme;
        image?: Image | null;
        canShow: boolean
    };
}

export function PartnerPageDescription() {
    const { content: { store: { description, theme, image = null, canShow } } } = useServer<PartnerPageDescriptionContent>();
    const componentRef = React.createRef<any>();

    function getScaledImage(prevImage: Image): Image {
        if (!prevImage) {
            return;
        }
        const nextImage = cloneDeep(prevImage);
        nextImage.sizes.desktop.src = nextImage.sizes.desktop.src.replace('static.hastens.com/', 'static.hastens.com/1440/');
        nextImage.sizes.tablet.src = nextImage.sizes.tablet.src.replace('static.hastens.com/', 'static.hastens.com/1200/');
        nextImage.sizes.mobile.src = nextImage.sizes.mobile.src.replace('static.hastens.com/', 'static.hastens.com/768/');
        return nextImage;
    }

    return description && canShow ? (
        <Background image={getScaledImage(image)} theme={theme}>
            <div
                ref={componentRef}
                className="has-partner-page-description">
                <RichText className="text-center">{description}</RichText>
            </div>
        </Background>
    ) : null;
}
