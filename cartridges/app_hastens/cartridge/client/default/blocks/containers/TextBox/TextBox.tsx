import './TextBox.scss';

import React, { FC } from 'react';

import { Background } from '../../../shared/components/Background';
import { Theme, useServer } from '../../server/ServerProvider';
import { RichText } from '../../../shared/components/typography/RichText';

interface TextBoxContent {
    text: {
        body: string;
    };
    theme: Theme;
}

export const TextBox: FC<any> = () => {

    const { content: { text: { body }, theme } } = useServer<TextBoxContent>();

    return (
        <Background theme={theme}>
            <RichText className="has-text-box">{body}</RichText>
        </Background>
    );
};


