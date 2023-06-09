import './main.scss';

import Glide from '@glidejs/glide';

const slideshows = document.querySelectorAll<HTMLElement>('[data-hastens-slideshow]');

slideshows.forEach((slideshow) => {
    const slides = slideshow.querySelectorAll('.glide__slides > div');

    // Add missing class
    slides.forEach((slide) => {
        slide.classList.add('glide__slide');
    });

    const data = JSON.parse(slideshow.getAttribute('data-hastens-slideshow'));
    const settings = getSettings(data);

    new Glide(slideshow, settings).mount();
});

function getSettings(data) {
    switch (data.animation) {
        case 'slide':
            return {
                gap: 0,
                autoplay: 6000,
                rewindDuration: 0,
                animationDuration: 500,
                perView: 1,
                animationTimingFunc: 'ease',
                type: 'carousel',
            };
        default:
            return {
                gap: 0,
                autoplay: 6000,
                rewindDuration: 0,
                animationDuration: 0,
            };
    }
}
