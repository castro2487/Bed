import './WaitListCTA.scss';

import React, { ReactElement } from 'react';
import { Background } from '../../../../shared/components/Background';
import { Link, useServer } from '../../../server/ServerProvider';

interface ServerContent {
    body: string;
    link: Link;
}

export default function WaitListCTA(): ReactElement {

    const { content } = useServer<ServerContent>();

    return (
        <Background theme="black-1">
            <div className="has-wait-list-cta">
                <p>{content.body}</p>
                {!!content.link.text && (
                    <a href={content.link.url} className="join-button">{content.link.text}</a>
                )}
            </div>
        </Background>
    );

}
