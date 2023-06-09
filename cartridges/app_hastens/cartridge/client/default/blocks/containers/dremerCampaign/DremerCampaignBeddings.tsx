import './DremerCampaignBeddings.scss';

import React, { ReactElement } from 'react';
import { Carousel } from 'react-responsive-carousel';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { VideoScrollBackground } from '../../../shared/components/VideoScrollBackground';
import { useServer } from '../../server/ServerProvider';

interface ServerContent {
    heading: string;
    body: string;
    slides: { text: string; }[];
}

export default function DremerCampaignBeddings(): ReactElement {
    const server = useServer<ServerContent>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className="has-dremer-campaign__beddings">
            <VideoScrollBackground
                sources={[
                    { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/bedding-video-bg_1.ogv', type: 'video/ogg' },
                    { src: 'https://d9hnfkiekn5wa.cloudfront.net/video/dreamer/bedding-video-bg_1.mp4', type: 'video/mp4' },
                ]}
                className="video-scroll-header"
            />
            <div className="top-text">
                <h2>{server.content.heading}</h2>
                <Paragraph>{server.content.body}</Paragraph>
            </div>
            <Carousel
                centerMode={!isMobile}
                centerSlidePercentage={isMobile ? 100 : 70}
                autoPlay={false}
                infiniteLoop
                interval={6000}
                swipeScrollTolerance={80}
                showIndicators={false}
                showStatus={false}
                showThumbs={false}
                showArrows
                renderArrowPrev={(onClickHandler, hasPrev) => {
                    if (hasPrev === false) {
                        return null;
                    }
                    return (
                        <button onClick={onClickHandler} className="slideshow-prev">
                            <span className="sr-only">Previous</span>
                            <i className="fa fa-angle-down" aria-hidden="true"></i>
                        </button>
                    );
                }}
                renderArrowNext={(onClickHandler, hasNext) => {
                    if (hasNext === false) {
                        return null;
                    }
                    return (
                        <button onClick={onClickHandler} className="slideshow-next">
                            <span className="sr-only">Next</span>
                            <i className="fa fa-angle-down" aria-hidden="true"></i>
                        </button>
                    );
                }}>
                {server.content.slides.map((slide, index) => (
                    <div className={`slide-content slide-content-${index + 1}`} key={index}>
                        <Paragraph>{slide.text}</Paragraph>
                    </div>
                ))}
            </Carousel>
        </div>
    );
}
