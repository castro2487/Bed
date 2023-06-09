import React, { ReactChild } from 'react';
import { Carousel } from 'react-responsive-carousel';
import './Slider.scss';

interface Props {
    slides: ReactChild[];
    autoPlay?: boolean;
    infiniteLoop?: boolean;
    showIndicators?: boolean;
}

const Slider = ({ slides, autoPlay, infiniteLoop, showIndicators }: Props) => (
    <Carousel
        className="has-slider"
        autoPlay={autoPlay}
        infiniteLoop={infiniteLoop}
        interval={6000}
        swipeScrollTolerance={80}
        showIndicators={showIndicators}
        showArrows={false}
        showStatus={false}
        showThumbs={false}>
        {slides}
    </Carousel>
);

Slider.defaultProps = {
    autoPlay: false,
    infiniteLoop: false,
    showIndicators: false,
};

export default Slider;
