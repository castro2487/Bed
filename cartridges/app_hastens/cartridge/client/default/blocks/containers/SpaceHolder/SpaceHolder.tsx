import React, { ReactElement } from 'react';
import { useServer, Theme } from '../../server/ServerProvider';
import { Background } from '../../../shared/components/Background';
import './SpaceHolder.scss';

interface SpaceHolderContent {
    theme: Theme;
    hideOnMobile: boolean;
}

export function SpaceHolder(): ReactElement {
    const { content } = useServer<SpaceHolderContent>();

    return (
        <Background theme={content.theme}>
            <div className={`
                has-space-holder
                ${content.hideOnMobile ? 'hidden-on-mobile' : ''}
            `}>
                <div className="content-wrapper"></div>
            </div>
        </Background>
    );
}
