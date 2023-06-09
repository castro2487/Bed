import './SupremeCTA.scss';

import React, { ReactElement } from 'react';

import { useServer, Link } from '../../../server/ServerProvider';
import { Button } from '../../../../shared/components/formFields/Button';

interface ServerContent {
    link: Link;
}

export default function SupremeCTA(): ReactElement {
    const server = useServer<ServerContent>();

    return (
        <div className="has-supreme-cta">
            <div className="content-wrapper">
                <div className="logo"></div>
                {server.content.link.url && (
                    <Button
                        className={server.getTrackingClassId('cta')}
                        href={server.content.link.url}
                        color="dark"
                        appearance="simple">
                        <span className="sr-only">Supreme</span>
                        {server.content.link.text}
                    </Button>
                )}
            </div>
        </div>
    );
}
