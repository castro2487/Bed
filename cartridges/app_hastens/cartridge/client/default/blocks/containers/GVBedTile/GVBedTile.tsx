import './GVBedTile.scss';

import React from 'react';

import { Image, Link, useServer } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';

export interface GVBedTileContent {
    link: Link;
    image: Image;
}

export function GVBedTile() {

    const { content } = useServer<GVBedTileContent>();

    return (
        <Background image={content.image} theme="black-1" className="has-gv-bed-tile">
            <div className="content-wrapper">
                <div className="main-text">
                    <h2 className="grand-vividus-heading">
                        <span className="sr-only">Grand Vividus</span>
                    </h2>
                    <Button color="light" href={content.link.url}>{content.link.text}</Button>
                </div>
            </div>
        </Background>
    );

}
