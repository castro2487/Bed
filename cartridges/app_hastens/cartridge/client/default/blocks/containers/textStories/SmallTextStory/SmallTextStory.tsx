import './SmallTextStory.scss';

import React, { ReactElement } from 'react';

import { Theme, useServer } from '../../../server/ServerProvider';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Background } from '../../../../shared/components/Background';
import { RichText } from '../../../../shared/components/typography/RichText';

interface SmallTextStoryContent {
    text: {
        heading: string;
        body: string;
    };
    headingWeight: 'regular' | 'bold';
    theme: Theme;
}

export function SmallTextStory(): ReactElement {
    const { content } = useServer<SmallTextStoryContent>();

    return (
        <Background theme={content.theme}>
            <div className="has-small-text-story">
                <div className="content-wrapper">
                    <section>
                        {content.text.heading && (
                            <Heading
                                className={`weight--${content.headingWeight}`}
                                level={2}
                                size="sm">
                                {content.text.heading}
                            </Heading>
                        )}
                        <RichText>{content.text.body || ''}</RichText>
                    </section>
                </div>
            </div>
        </Background>
    );
}
