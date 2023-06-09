import React from 'react';
import { Image, useServer } from '../../../server/ServerProvider';
import { PortraitBlockOne } from './PortraitBlockOne';
import { PortraitBlockTwo } from './PortraitBlockTwo';

export interface RestoreSignupText {
    heading: string;
    subHeading: string;
    text1: string;
    text2: string;
    text3: string;
    fullName: string;
    email: string;
    sendRequest: string;
    agreement: string;
    buttonText: string;
}
export interface RestoreSignupContent {
    image: Image;
    format?: 1 | 2;
    text: RestoreSignupText;
    mailto: 'jussi' | 'peter';
}

export const RestoreSignup: React.FC = () => {
    const { content: { image, format, text, mailto } } = useServer<RestoreSignupContent>();

    if (Number(format) === 1) {
        return (
            <PortraitBlockOne
                mailto={mailto}
                image={image}
                text={text}
            />
        );
    } else {
        return (
            <PortraitBlockTwo
                mailto={mailto}
                image={image}
                text={text}
            />
        );
    }
};
