import React, { ReactElement } from 'react';

import { useServer, Image, Theme } from '../../../server/ServerProvider';
import { Background } from '../../../../shared/components/Background';
import { DesignerHeader, VariationType } from '../../../../shared/components/DesignerHeader';
import './DesignerHero.scss';

interface DesignerHeroContent {
    image: Image;
    theme: Theme;
    useTextShadow: boolean;
    variation: VariationType;
    text: {
        by: string;
        heading: string;
        body: string;
        collection: string;
        designer: string;
    };
}

export function DesignerHero(): ReactElement {
    const { content } = useServer<DesignerHeroContent>();

    return (
        <Background image={content.image} theme={content.theme}>
            <div className="has-designer-hero">
                <div className="content-wrapper">
                    <section>
                        <DesignerHeader
                            byTranslation={content.text.by}
                            collection={content.text.collection}
                            designer={content.text.designer}
                            textShadow={content.useTextShadow}
                            variation={content.variation}
                        />
                    </section>
                </div>
            </div>
        </Background>
    );
}
