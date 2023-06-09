import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { isIOS } from '../helpers';

interface Props {
    sources: {
        src: string;
        type: 'video/ogg' | 'video/mp4';
    }[];
    className?: string;
}

const useStyles = makeStyles(() => createStyles({
    root: {
        position: 'relative',
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    content: {
        position: 'relative',
    },
}));

export function VideoScrollBackground(props: PropsWithChildren<Props>) {
    const classes = useStyles();
    const rootRef = useRef<HTMLDivElement>();
    const videoRef = useRef<HTMLVideoElement>();
    const frameRate = 30;
    let currentTime = 0;

    useEffect(() => {
        setInterval(() => {
            if (videoRef) {
                videoRef.current.currentTime = currentTime;
            }
        }, (1000 / frameRate));

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function handleScroll() {
        const rootRect = rootRef.current.getBoundingClientRect();
        const videoDuration = videoRef.current.duration;
        const startPosition = window.scrollY + rootRect.y - window.innerHeight;
        const endPosition = window.scrollY + rootRect.y + rootRect.height;
        const secondsPerPixel = videoDuration / (endPosition - startPosition);
        const scrollPosition = window.scrollY - startPosition;
        const videoPosition = scrollPosition * secondsPerPixel;

        if (videoPosition >= 0 && videoPosition <= videoDuration) {
            currentTime = videoPosition;
        }
    }

    return (
        <div ref={rootRef} className={classes.root}>
            <video ref={videoRef} className={classes.video} preload={isIOS() ? 'metadata' : 'auto'} muted playsInline>
                {props.sources.map((source, index) => (
                    <source key={index} src={source.src} type={source.type} />
                ))}
            </video>
            <div className={clsx(classes.content, props.className)}>{props.children}</div>
        </div>
    );
}
