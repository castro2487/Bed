import React from 'react';
import clsx from 'clsx';

import './DesignerHeader.scss';
import { StringHelper } from './StringHelper';

export type VariationType = 'default' | 'variation1';
interface Props {
    designer: string;
    collection: string;
    textShadow?: boolean;
    byTranslation: string;
    variation?: VariationType;
}

DesignerHeader.defaultProps = {
    variation: 'default',
};

export function DesignerHeader({ collection, designer, variation, textShadow, byTranslation }: Props) {
    return (
        <header className={clsx(
            'has-designer-header',
            {
                'add-shadow': textShadow,
            },
        )}>
            <p className="thin">Hästens</p>
            <p className={clsx(
                'collection-name',
                {
                    'bold': variation === 'default',
                    'always-big': variation === 'variation1',
                },
            )}><strong>{collection}</strong></p>
            <p className="small">
                <StringHelper
                    parameters={[
                        <strong key="bold" className="bold">{designer}</strong>,
                    ]}>
                    {byTranslation}
                </StringHelper>
            </p>
        </header>
    );
}
