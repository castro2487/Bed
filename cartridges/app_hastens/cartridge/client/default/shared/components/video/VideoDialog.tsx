import './VideoDialog.scss';

import React, { ReactElement } from 'react';

import { VideoPlayer } from './VideoPlayer';
import Dialog from '../dialogs/Dialog';

interface Props {
    open: boolean;
    url: string;
    theme: 'light' | 'dark';
    onClose: () => void;
}

export function VideoDialog(props: Props): ReactElement {

    return (
        <Dialog
            className="has-video-dialog"
            size="fullScreen"
            theme={props.theme || 'dark'}
            open={props.open}
            onClose={props.onClose}>
            <div className="dialog-content">
                <section className="player-container">
                    <VideoPlayer
                        autoPlay
                        src={props.url}
                        theme={props.theme}
                    />
                </section>
            </div>
        </Dialog>
    );

}
