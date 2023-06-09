import './SlickSlider.scss';

import React, { ReactElement, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import clsx from 'clsx';

interface Props {
    className?: string;
    initialSlide?: number;
    children: ReactElement[];
    onBeforeChange?: (currentSlide, nextSlide) => void;
}

export function SlickSlider({ initialSlide, children, className, onBeforeChange }: Props): ReactElement {

    const sliderRef = useRef(null);

    useEffect(() => {
        // The initialSlide feature in Slick doesn't work at the moment, this is a temporary solution until the bug is fixed
        if (initialSlide !== undefined) {
            sliderRef.current.slickGoTo(initialSlide, true);
        }
    }, []);

    return (
        <Slider
            ref={sliderRef}
            className={clsx('has-slick-slider', className)}
            beforeChange={(currentSlide, nextSlide) => {
                if (currentSlide !== nextSlide && onBeforeChange) {
                    onBeforeChange(currentSlide, nextSlide);
                }
            }}
            speed={600}
            dots={false}
            infinite={false}
            draggable={false}
            prevArrow={<PrevArrow />}
            nextArrow={<NextArrow />}>
            {children}
        </Slider>
    );

}

export function PrevArrow(props) {
    return (
        <button {...props}>
            <span className="sr-only">Previous</span>
            <i className="fa fa-angle-down" aria-hidden="true"></i>
        </button>
    );
}

export function NextArrow(props) {
    return (
        <button {...props}>
            <span className="sr-only">Next</span>
            <i className="fa fa-angle-down" aria-hidden="true"></i>
        </button>
    );
}
