import './DremerCampaignCTA.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../shared/components/Background';
import { useServer, Link } from '../../server/ServerProvider';
import { Button } from '../../../shared/components/formFields/Button';

interface ServerContent {
    heading: string;
    body: string;
    link: Link;
}

export default function DremerCampaignCTA(): ReactElement {
    const server = useServer<ServerContent>();

    return (
        <Background theme="black-1">
            <div className="has-dremer-campaign__cta">
                <div className="content-wrapper">
                    <div className="main-text">
                        <h2>{server.content.heading}</h2>
                        <p>{server.content.body}</p>
                        <Button
                            className={server.getTrackingClassId('cta')}
                            href={server.content.link.url}
                            color="light"
                            appearance="simple">
                            <span className="sr-only">{server.content.heading}</span>
                            {server.content.link.text}
                        </Button>
                    </div>
                </div>
            </div>
        </Background>
    );

}
