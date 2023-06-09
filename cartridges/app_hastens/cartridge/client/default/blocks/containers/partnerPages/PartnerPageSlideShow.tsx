import React from 'react';

import './PartnerPageSlideShow.scss';
import { Image, Theme, useServer } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { HastensPartnerSlide1 } from './HastensPartnerSlide1';
import Slider from '../../../shared/components/Slider';

interface PartnerSlideShowContent {
    store: {
        slideShow: {
            'hide-nav': string;
            'is-randomized': string;
            slides: {
                image: string;
                header: string;
                'header-prefix': string;
                'header-suffix': string;
                theme: Theme
            }[];
        };
        canShow: boolean;
    };
}

export function PartnerPageSlideShow() {
    const { content: { store: { slideShow } } } = useServer<PartnerSlideShowContent>();

    const slidesArray: JSX.Element[] = [
        <div key="slide1"><HastensPartnerSlide1 /></div>,
        ...slideShow?.slides?.map((slide, index) => (
            <div key={index}>
                <Background image={getImage(slide.image)} theme={slide.theme}>
                    <div className="has-partner-slide-data">
                        <div className="content d-flex flex-column justify-content-center">
                            {slide.header && (
                                <Heading level={2} size="xl" className="header"><small>{slide['header-prefix']}</small> {slide.header}</Heading>
                            )}
                            {slide['header-suffix'] && (
                                <Paragraph size="lg">{slide['header-suffix']}</Paragraph>
                            )}
                        </div>
                    </div>
                </Background>
            </div>
        )) || [],
    ];

    function getImage(imageUrl: string): Image {
        return {
            sizes: {
                mobile: { src: imageUrl.replace('static.hastens.com/', 'static.hastens.com/768/') },
                tablet: { src: imageUrl.replace('static.hastens.com/', 'static.hastens.com/1200/') },
                desktop: { src: imageUrl.replace('static.hastens.com/', 'static.hastens.com/1440/') },
            },
        };
    }

    function randomize(): JSX.Element[] {
        for (let i = slidesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = slidesArray[i];
            slidesArray[i] = slidesArray[j];
            slidesArray[j] = temp;
        }
        return slidesArray;
    }

    return (
        <div className="has-partner-slides-show">
            <Slider
                autoPlay
                infiniteLoop
                showIndicators
                slides={JSON.parse(slideShow?.['is-randomized'] || 'false') ? randomize() : slidesArray}
            />
        </div>
    );
}
