import './DesignerBanner.scss';

import React, { ReactElement } from 'react';

import { useServer, Image, Link, Theme } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getButtonColor } from '../../../../shared/muiTheme';
import { DesignerHeader } from '../../../../shared/components/DesignerHeader';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { addParamsToString } from '../../../../shared/components/StringHelper';

export interface DesignerBannerContent {
    image: Image;
    link: Link;
    theme: Theme;
    buttonColor: ButtonColor;
    text: {
        by: string;
        collection: string;
        designer: string;
        body: string;
    };
}

/*  This is deprecated */
export function DesignerBanner(): ReactElement {
    const { content } = useServer<DesignerBannerContent>();

    function getHeaderAsString(): string {
        if (content.text.designer) {
            return `${content.text.collection} ${addParamsToString(content.text.by, content.text.designer)}`;
        }
        return content.text.collection;
    }

    return (
        <Background image={content.image} theme={content.theme}>
            <div className="has-designer-banner-1">
                <div className="content-wrapper">
                    <div className="content">
                        <DesignerHeader
                            byTranslation={content.text.by}
                            collection={content.text.collection}
                            designer={content.text.designer}
                        />

                        <div className="story">
                            <Paragraph className="text">
                                {content.text.body}
                            </Paragraph>
                        </div>
                        {content.link.url && (
                            <Button
                                size="medium"
                                href={content.link.url}
                                color={content.buttonColor || getButtonColor(content.theme)}>
                                <span className="sr-only">{getHeaderAsString()}</span>
                                {content.link.text}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Background >
    );
}
