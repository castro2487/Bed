import React, { ReactElement, useState, useRef, Suspense, lazy } from 'react';
import clsx from 'clsx';

import './PopupVideo.scss';

import { Background, Props as BackgroundProps } from '../Background';
import { isIOS } from '../../../shared/helpers';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Heading } from '../../../shared/components/typography/Heading';
import { PlayButton } from '../../../shared/components/video/PlayButton';
import { useServer } from '../../../blocks/server/ServerProvider';

export type DialogTheme = 'dark' | 'light';
export type TextPosition = 'left' | 'bottom';

interface Props {
    heading?: string;
    body?: string;
    textPosition?: TextPosition;
    url: string;
    ratio: '16-9' | '3-2';
    dialogTheme?: DialogTheme;
    BackgroundProps?: BackgroundProps;
    className?: string;
}

PopupVideo.defaultProps = {
    textPosition: 'left',
    dialogTheme: 'dark',
    ratio: '16-9',
} as Props;

const VideoDialog = lazy(() => import(/* webpackChunkName: "popup-video-dialog" */ './VideoDialog').then((module) => ({ default: module.VideoDialog })));

export function PopupVideo(props: Props): ReactElement {

    const server = useServer();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    const [pendingCanPlay, setPendingCanPlay] = useState(false);
    const hasText = !!props.heading || !!props.body;
    const iOSPlayerRef = useRef<HTMLVideoElement>();

    return (
        <Background {...props.BackgroundProps}>
            <div className={clsx('has-popup-video', props.className)}>
                <div className={clsx('button-wrapper', `ratio--${props.ratio}`)}>
                    <PlayButton
                        pending={pendingCanPlay}
                        onClick={() => {
                            if (isIOS()) {
                                iOSPlayerRef.current.currentTime = 0;
                                iOSPlayerRef.current.play();
                                if (!canPlay) {
                                    setPendingCanPlay(true);
                                }
                            } else {
                                setDialogOpen(true);
                            }
                        }}
                    />
                </div>
                {hasText && (
                    <div className={clsx('text-wrapper', `text-position--${props.textPosition || 'left'}`)}>
                        <header>
                            <Heading level={2} size="md" className="heading">{props.heading}</Heading>
                            <Paragraph className="body">{props.body}</Paragraph>
                        </header>
                    </div>
                )}
                {isIOS() ? (
                    <video
                        className="ios-player"
                        preload="none"
                        ref={iOSPlayerRef}
                        onCanPlay={() => {
                            setCanPlay(true);
                            setPendingCanPlay(false);
                        }}
                        onError={() => {
                            setPendingCanPlay(false);
                            if (server) {
                                server.alertError();
                            }
                        }}>
                        <source src={encodeURI(props.url)} />
                    </video>
                ) : (
                    <Suspense fallback={null}>
                        <VideoDialog
                            open={dialogOpen}
                            url={props.url}
                            theme={props.dialogTheme}
                            onClose={() => setDialogOpen(false)}
                        />
                    </Suspense>
                )}
            </div>
        </Background>

    );

}
