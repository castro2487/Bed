import './MaterialsTextStory.scss';

import React, { ReactElement } from 'react';

import { Background } from '../../../../shared/components/Background';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { useServer, Image, Theme } from '../../../server/ServerProvider';
import { TextColumns } from '../../../../shared/components/TextColumns';

type Background = string;
interface MaterialsTextBoxContent {
    image: Image;
    theme: Theme;
    text: {
        headingMain?: string;
        bodyMain?: string;
        body: string
    };
    background?: Background;
    columns: 1 | 2;
}

export function MaterialsTextStory(): ReactElement {

    const { content: {
        theme, image, text, columns, background = '#ffffff',
    } } = useServer<MaterialsTextBoxContent>();
    const props = { background };

    return (
        <div className="has-material-text-story" style={{ background: props.background }}>
            <Background image={image} theme={theme}>
                <div className="top-container">
                    <div className="outer-wrapper">
                        <div className="inner-wrapper">
                            <Heading level={2} size="sm" className="mts-heading">{text.headingMain}</Heading>
                            <Paragraph className="mts-body">{text.bodyMain}</Paragraph>
                        </div>
                    </div>
                </div>
            </Background>
            <Background theme={theme}>
                <div className="bottom-container" style={{ background: props.background }}>
                    <div className="outer-wrapper">
                        <div className="inner-wrapper">
                            <Heading level={2} size="sm" className="mts-heading">{text.headingMain}</Heading>
                            <Paragraph className="mts-body">{text.bodyMain}</Paragraph>
                        </div>
                    </div>
                    <TextColumns
                        text={text}
                        columns={columns}
                    />
                </div>
            </Background>
        </div>
    );
}
