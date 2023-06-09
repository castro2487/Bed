import React from 'react';
import { Image, useServer } from '../../../server/ServerProvider';

import './PartnerSlide.scss';

interface PartnerSlideContent {
    text: {
        name: string;
        quote: string;
        location: string;
    };
    image: Image;
}

export const PartnerSlide = () => {

    const { content: { text, image } } = useServer<PartnerSlideContent>();

    return (
        <div className="has-partner-slide">
            <img src={image.sizes.desktop.src} alt={text.name} className="slider-image" />
            <div className="flex-column">
                <p className="quote">{text.quote}<i className="end-icon">&nbsp;</i></p>
                <div className="footer">
                    <p className="name-holder">{text.name}</p>
                    <p className="location-holder">{text.location}</p>
                </div>
            </div>
        </div>
    );
};
