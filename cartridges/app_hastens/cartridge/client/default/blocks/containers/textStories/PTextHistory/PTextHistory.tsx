import './PTextHistory.scss';

import React from 'react';

import { Theme, useServer } from '../../../server/ServerProvider';
import { RichText } from '../../../../shared/components/typography/RichText';
import { Background } from '../../../../shared/components/Background';

interface PTextHistoryContent {
    heading: string;
    body: string;
    theme: Theme;
}

export const PTextHistory: React.FC<any> = () => {

    const { content } = useServer<PTextHistoryContent>();

    return (
        <Background theme={content.theme}>
            <div className="has-heritage-text-story">
                <div className="content-wrapper">
                    <div className="column-1">
                        <h2 className="heading">{content.heading}</h2>
                        <RichText className="body">{content.body}</RichText>
                    </div>
                    <div className="column-2">
                    </div>
                </div>
            </div>
        </Background>
    );
};
