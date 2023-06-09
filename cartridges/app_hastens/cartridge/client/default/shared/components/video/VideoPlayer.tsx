import React, { forwardRef, ReactElement, useEffect, useRef, useState } from 'react';
import { Player, BigPlayButton } from 'video-react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { useServer } from '../../../blocks/server/ServerProvider';
import { gtmEvent, GTMEventName } from '../../helpers';

interface Props {
    autoPlay?: boolean;
    preload?: string;
    src?: string;
    className?: string;
    theme?: 'light' | 'dark';
}

const useStyles = makeStyles({
    player: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    lightPlayer: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    pendingPlayer: {
        '& .video-react-loading-spinner': {
            display: 'block',
        },
    },
});

const videoGTMEvents: { name: GTMEventName; triggerPoint: number; }[] = [
    { name: 'Video25', triggerPoint: 25 },
    { name: 'Video50', triggerPoint: 50 },
    { name: 'Video75', triggerPoint: 75 },
    { name: 'Video100', triggerPoint: 100 },
];

export const VideoPlayer = forwardRef(function VideoPlayer({ autoPlay, preload, src, className, theme }: Props, ref): ReactElement {
    const classes = useStyles();
    const [canPlay, setCanPlay] = useState(false);
    const server = useServer();
    const triggeredGTMEvents = [];
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    function handlePlay(event) {
        const videoElement = event.target as HTMLVideoElement;
        event.persist();

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        handleTimeUpdate(videoElement);
        intervalRef.current = setInterval(
            () => {
                handleTimeUpdate(videoElement);
            },
            // Trigger 1 time per 1% of the video
            videoElement.duration * 1000 / 100,
        );
    }

    function handleTimeUpdate(videoElement: HTMLVideoElement) {
        const playProgress = Math.round(videoElement.currentTime / videoElement.duration * 100);

        videoGTMEvents.forEach((videoEvent) => {
            const distanceToTriggerPoint = Math.abs(playProgress - videoEvent.triggerPoint);

            if (distanceToTriggerPoint <= 1 && triggeredGTMEvents.indexOf(videoEvent.name) === -1) {
                gtmEvent(videoEvent.name);
                triggeredGTMEvents.push(videoEvent.name);
            }
        });
    }

    function handlePause() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    return (
        <Player
            ref={ref}
            className={clsx(
                className,
                classes.player,
                {
                    [classes.lightPlayer]: theme === 'light',
                    [classes.pendingPlayer]: !canPlay,
                },
            )}
            autoPlay={autoPlay}
            preload={preload}
            src={encodeURI(src)}
            onPlay={handlePlay}
            onPause={handlePause}
            onCanPlay={() => {
                setCanPlay(true);
            }}
            onError={() => {
                if (server) {
                    server.alertError();
                }
            }}>
            <BigPlayButton disabled />
        </Player>
    );
});
