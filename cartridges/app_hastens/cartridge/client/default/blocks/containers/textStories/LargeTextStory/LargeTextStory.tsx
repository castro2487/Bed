import './LargeTextStory.scss';

import React, { ReactElement } from 'react';

import { useServer, Theme, Link, Image } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { TextColumns } from '../../../../shared/components/TextColumns';
import { Button, ButtonColor } from '../../../../shared/components/formFields/Button';
import { getPaletteType, getButtonColor } from '../../../../shared/muiTheme';
import clsx from 'clsx';
import { hasImage } from '../../../../shared/helpers';
import { AppStoreButton } from '../../../../shared/components/formFields/AppStoreButton/AppStoreButton';

export interface LargeTextStoryContent {
    text: {
        heading: string;
        body: string;
    };
    image?: Image;
    theme: Theme;
    buttonColor: ButtonColor;
    columns: 1 | 2;
    textAlignment: 'left' | 'center';
    link?: Link;
    buttonAppearance?: 'standard' | 'simple' | 'appleAppStore';
}

export function LargeTextStory(): ReactElement {
    const { content, getTrackingClassId } = useServer<LargeTextStoryContent>();

    return (
        <Background image={content.image} theme={content.theme}>
            <div className={clsx(
                'has-large-text-story',
                (hasImage(content.image) && 'image-padding'),
            )}>
                <TextColumns
                    text={content.text}
                    columns={content.columns}
                    textAlignment={content.textAlignment}
                />
                {content.link?.url && (
                    <div className="button-wrapper">
                        {content.buttonAppearance === 'appleAppStore' ? (
                            <AppStoreButton
                                href={content.link.url}
                                theme={getPaletteType(content.theme)}
                            />
                        ) : (
                            <Button
                                className={getTrackingClassId('cta')}
                                href={content.link.url}
                                color={content.buttonColor || getButtonColor(content.theme)}>
                                {content.link.text}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Background>
    );
}
