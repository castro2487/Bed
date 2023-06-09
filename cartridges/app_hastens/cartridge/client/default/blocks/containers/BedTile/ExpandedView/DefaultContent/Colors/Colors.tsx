import './Colors.scss';

import React, { Fragment, ReactElement, useRef, useState } from 'react';

import { Paragraph } from '../../../../../../shared/components/typography/Paragraph';
import { VideoPlayer } from '../../../../../../shared/components/video/VideoPlayer';
import { useServer, Image } from '../../../../../server/ServerProvider';
import { BedTileContent } from '../../../helpers';
import { Background } from '../../../../../../shared/components/Background';
import { SlickSlider } from './SlickSlider';
import { PlayButton } from '../../../../../../shared/components/video/PlayButton';
import Dialog from '../../../../../../shared/components/dialogs/Dialog';

interface Props {
    items: {
        thumbnail: {
            src: string;
        };
        image: Image;
        video: string;
    }[];
    onOpenDialog: () => void;
    onCloseDialog: () => void;
}

Colors.defaultProps = {
    items: [],
};

export default function Colors(props: Props): ReactElement {

    const { content: { text } } = useServer<BedTileContent>();
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeVideoIndex, setActiveVideoIndex] = useState(-1);
    const videoRefs = useRef({});

    function openDialog() {
        videoRefs.current = {};
        setActiveVideoIndex(-1);
        setDialogIsOpen(true);
        props.onOpenDialog();
    }

    function closeDialog() {
        setDialogIsOpen(false);
        props.onCloseDialog();
    }

    function handleBeforeChangeSlide() {
        Object.keys(videoRefs.current).forEach((key) => {
            videoRefs.current[key].pause();
        });
    }

    if (props.items.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <div className="has-bed-tile__colors">
                <Paragraph size="sm">{text.enlargeImage}</Paragraph>
                <ul>
                    {props.items.map((slide, index) => (
                        <li key={index}>
                            <button
                                className="thumbnail"
                                onClick={() => {
                                    setSelectedIndex(index);
                                    openDialog();
                                }}
                                style={{ backgroundImage: `url(${slide.thumbnail.src})` }}>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <Dialog
                className="has-bed-tile__colors-dialog"
                open={dialogIsOpen}
                theme="dark"
                onClose={() => {
                    closeDialog();
                }}>
                <div className="dialog-content">
                    <SlickSlider initialSlide={selectedIndex} onBeforeChange={handleBeforeChangeSlide}>
                        {props.items.map((item, index) => (
                            <div key={index} className="slide-content">
                                {activeVideoIndex === index ? (
                                    <VideoPlayer
                                        className="video"
                                        theme="dark"
                                        autoPlay={true}
                                        preload="auto"
                                        src={item.video}
                                        ref={(ref) => {
                                            if (ref) {
                                                videoRefs.current[index] = ref;
                                            }
                                        }}
                                    />
                                ) : (
                                    <Background
                                        className="image"
                                        image={item.image}>
                                        {item.video && (
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
                    </SlickSlider>
                </div>
            </Dialog>
        </Fragment>
    );

}

