import './DesignerCTA.scss';

import React, { Fragment, ReactElement } from 'react';

import { Background } from '../../../../shared/components/Background';
import { useServer, Image, Link, Theme } from '../../../server/ServerProvider';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { DesignerHeader } from '../../../../shared/components/DesignerHeader';
import { getButtonColor } from '../../../../shared/muiTheme';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';
import { addParamsToString, StringHelper } from '../../../../shared/components/StringHelper';

interface DesignerCTAContent {
    image: Image;
    link: Link;
    theme: Theme;
    buttonColor: ButtonColor;
    variation: 'variation-1' | 'variation-2' | 'variation-3' | 'variation-4' | 'variation-5';
    text: {
        by: string;
        collection: string;
        designer: string;
        body: string;
    };
}

export function DesignerCTA(): ReactElement {
    const { scaleWidthRecommendation, content: {
        image, link, theme, buttonColor, variation,
        text: { collection, designer, body, by },
    } } = useServer<DesignerCTAContent>();

    function getHeader() {
        switch (variation) {
            case 'variation-2':
                return (
                    <Fragment>
                        <p className="top-text">Hästens</p>
                        <Heading className="heading" level={2} size="sm">{collection}</Heading>
                    </Fragment>

                );
            case 'variation-3':
                return (
                    <Fragment>
                        <Heading className="heading" level={2} size="sm">{collection}</Heading>
                        <Paragraph size="sm" className="designer">
                            <StringHelper
                                parameters={[
                                    <span key="upper" className="upper">{designer}</span>,
                                ]}>
                                {by}
                            </StringHelper>
                        </Paragraph>
                    </Fragment>
                );
            default:
                return (
                    <DesignerHeader
                        byTranslation={by}
                        collection={collection}
                        designer={designer}
                    />
                );
        }
    }

    function getHeaderAsString(): string {
        if (designer) {
            return `${collection} ${addParamsToString(by, designer)}`;
        }
        return collection;
    }

    function variation5() {
        return (
            <div className={variation}>
                <Background image={image} scaleWidth={scaleWidthRecommendation} theme={theme}>
                    <div className="image-spacer" />
                </Background>
                <Background theme={theme}>
                    <div className="content-wrapper">
                        {collection && <h2 className="heading">{collection}</h2>}
                        {designer && (
                            <p className="subheading">
                                <StringHelper
                                    parameters={[
                                        <span key="upper" className="upper">{designer}</span>,
                                    ]}>
                                    {by}
                                </StringHelper>
                            </p>
                        )}
                        <Paragraph className="body">{body}</Paragraph>
                        {link.url && (
                            <a className="btn-text-link" href={link.url}>
                                <span className="sr-only">{getHeaderAsString()}</span>
                                {link.text}
                            </a>
                        )}
                    </div>
                </Background>
            </div>
        );
    }

    return (
        <div className="has-designer-cta">
            {variation === 'variation-5' ? (
                variation5()
            ) : (
                <Background image={image} scaleWidth={scaleWidthRecommendation} theme={theme}>
                    <div className={variation}>
                        <div className="content-wrapper">
                            <div>
                                {getHeader()}
                                {body && (
                                    <Paragraph className="body">{body}</Paragraph>
                                )}
                                {link.url && (
                                    <Button
                                        size="medium"
                                        href={link.url}
                                        color={buttonColor || getButtonColor(theme)}>
                                        <span className="sr-only">{getHeaderAsString()}</span>
                                        {link.text}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Background>
            )}
        </div>
    );
}
