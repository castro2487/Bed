import './main.scss';

import Glide from '@glidejs/glide';

const sliders = document.querySelectorAll<HTMLElement>('[data-hastens-slider]');

sliders.forEach((slider) => {
    const slides = slider.querySelectorAll('.glide__slides > div');

    // Add missing class
    slides.forEach((slide) => {
        slide.classList.add('glide__slide');
    });

    const data = JSON.parse(slider.getAttribute('data-hastens-slider'));
    const settings = getSettings(data);

    new Glide(slider, settings).mount();
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
