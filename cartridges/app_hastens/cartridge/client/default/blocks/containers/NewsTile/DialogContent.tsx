import './DialogContent.scss';

import React, { ReactElement, useRef, useState } from 'react';
import MuiDialogContent from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core/styles';
import Slider from 'react-slick';

import { Background } from '../../../shared/components/Background';
import { VideoPlayer } from '../../../shared/components/video/VideoPlayer';
import { PlayButton } from '../../../shared/components/video/PlayButton';
import { Image } from '../../server/ServerProvider';
import { RichText } from '../../../shared/components/typography/RichText';

interface Props {
    heading: string;
    body: string;
    media: {
        image: Image;
        video: string;
    }[];
}

const useDialogContentStyles = makeStyles({
    root: {
        padding: 0,
    },
});

export function DialogContent(props: Props): ReactElement {

    const [activeVideoIndex, setActiveVideoIndex] = useState(-1);
    const videoRefs = useRef({});
    const dialogContentStyles = useDialogContentStyles();

    return (
        <MuiDialogContent className="has-news-tile--dialog-content" classes={dialogContentStyles}>
            {props.media.length > 0 && (
                <Slider
                    className="media-slider"
                    beforeChange={() => {
                        Object.keys(videoRefs.current).forEach((key) => {
                            videoRefs.current[key].pause();
                        });
                    }}
                    speed={600}
                    dots={true}
                    prevArrow={<PrevArrow />}
                    nextArrow={<NextArrow />}
                    infinite={false}
                    draggable={false}
                    slidesToShow={1}
                    slidesToScroll={1}>
                    {props.media.map((mediaItem, index) => (
                        <div key={index} className="media-slide">
                            {activeVideoIndex === index ? (
                                <div className="video-media">
                                    <div className="inner-wrapper">
                                        <VideoPlayer
                                            autoPlay={true}
                                            preload="auto"
                                            src={mediaItem.video}
                                            ref={(ref) => {
                                                if (ref) {
                                                    videoRefs.current[index] = ref;
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <Background className="image-media" image={mediaItem.image}>
                                    {mediaItem.video && (
                                        <PlayButton
                                            onClick={() => {
                                                setActiveVideoIndex(index);
                                            }}
                                        />
                                    )}
                                </Background>
                            )}
                        </div>
                    ))}
                </Slider>
            )}
            <div className="text">
                <h2 className="heading">{props.heading}</h2>
                <RichText>{props.body}</RichText>
            </div>
        </MuiDialogContent>
    );

}

function PrevArrow(props) {
    return (
        <button
            className={props.className}
            style={props.style}
            onClick={props.onClick}
            aria-hidden="true">
            <span className="sr-only">Previous</span>
            <i className="fa fa-angle-down" aria-hidden="true"></i>
        </button>
    );
}

function NextArrow(props) {
    return (
        <button
            className={props.className}
            style={props.style}
            onClick={props.onClick}
            aria-hidden="true">
            <span className="sr-only">Next</span>
            <i className="fa fa-angle-down" aria-hidden="true"></i>
        </button>
    );
}
