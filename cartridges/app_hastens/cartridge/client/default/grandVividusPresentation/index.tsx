import './main.scss';

declare let ScrollMagic: any;
declare let TimelineMax: any;

const controller = new ScrollMagic.Controller();

const block = document.querySelector('[data-magic-scroll]');

/**
 * Video
 */

const video = block.querySelector('[data-video]') as HTMLVideoElement;

const videoDuration = 22.756067;
const frameRate = 30;
const offset = 1;
let videoPos = 0;

const videoScene = new ScrollMagic.Scene({
    duration: (videoDuration * 1000) - (offset * 1000),
    triggerElement: block,
    triggerHook: 0,
});

videoScene.setPin(block);
videoScene.addTo(controller);
videoScene.on('update', (event) => {
    const scrollPos = event.scrollPos / 1000;
    const startPos = event.startPos / 1000;
    videoPos = Math.max(0, scrollPos - startPos + offset);
});

setInterval(() => {
    video.currentTime = videoPos;
}, (1000 / frameRate));

/**
 * Text
 */

const tweens = block.querySelectorAll('[data-tween]') as NodeListOf<HTMLDivElement>;

tweens.forEach((tween) => {
    const dataFrom = parseFloat(tween.getAttribute('data-from')) || 0;
    const dataDuration = parseFloat(tween.getAttribute('data-duration')) || 1;

    const textScene = new ScrollMagic.Scene({
        duration: dataDuration * 1000,
        offset: (dataFrom * 1000) - (offset * 1000),
        triggerElement: block,
        triggerHook: 0,
    });

    const timeline = new TimelineMax();

    timeline.fromTo(tween, {
        opacity: 0,
        transform: 'translate(0, 50px)',
    }, {
        display: 'block',
        opacity: 1,
        transform: 'translate(0, 0)',
    });

    timeline.fromTo(tween, {
        opacity: 1,
        transform: 'translate(0, 0)',
    }, {
        opacity: 0,
        transform: 'translate(0, -50px)',
    });

    textScene.setTween(timeline);
    textScene.addTo(controller);
});
