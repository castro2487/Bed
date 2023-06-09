import './DremerCampaignHero2.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../shared/components/Background';
import { useServer } from '../../server/ServerProvider';

interface ServerContent {
    heading: string;
    body: string;
}

export default function DremerCampaignHero2(): ReactElement {
    const server = useServer<ServerContent>();

    return (
        <Background theme="black-1">
            <div className="has-dremer-campaign__hero-2">
                <div className="content-wrapper">
                    <div className="main-text">
                        <h2>{server.content.heading}</h2>
                        <p>{server.content.body}</p>
                    </div>
                </div>
            </div>
        </Background>
    );

}
