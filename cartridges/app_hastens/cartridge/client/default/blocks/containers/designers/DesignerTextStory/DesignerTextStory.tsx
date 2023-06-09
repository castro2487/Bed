import './DesignerTextStory.scss';

import React, { ReactElement } from 'react';

import { useServer, Theme, Link } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { DesignerHeader } from '../../../../shared/components/DesignerHeader';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import { getButtonColor } from '../../../../shared/muiTheme';

interface DesignerTextStoryContent {
    text: {
        by: string;
        heading: string;
        body: string;
        collection: string;
        designer: string;
    };
    link: Link;
    theme: Theme;
    buttonColor: ButtonColor;
}

export function DesignerTextStory(): ReactElement {
    const { content } = useServer<DesignerTextStoryContent>();

    return (
        <Background theme={content.theme}>
            <div className="has-designer-text-story">
                <div className="content-wrapper">
                    <DesignerHeader
                        byTranslation={content.text.by}
                        collection={content.text.collection}
                        designer={content.text.designer}
                    />
                    <section>
                        {content.text.heading && (
                            <Heading level={2} size="md">{content.text.heading}</Heading>
                        )}
                        <Paragraph className="story">{content.text.body || ''}</Paragraph>
                    </section>

                    {content.link.url && (
                        <footer>
                            <Button
                                href={content.link.url}
                                color={content.buttonColor || getButtonColor(content.theme)}>
                                {content.link.text}
                            </Button>
                        </footer>
                    )}
                </div>
            </div>
        </Background>
    );
}
