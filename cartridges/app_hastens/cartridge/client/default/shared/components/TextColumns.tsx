import './TextColumns.scss';

import React, { ReactElement } from 'react';
import clsx from 'clsx';
import { Heading, HeadingSize } from './typography/Heading';

export interface TextColumnsProps {
    text: {
        heading?: string;
        body: string;
    };
    columns: 1 | 2;
    headingSize?: HeadingSize;
    textAlignment?: 'left' | 'center';
}

export function TextColumns({ text, columns, textAlignment, headingSize }: TextColumnsProps): ReactElement {

    const legacyColumnBreaker = '<p id="column-breaker">break column</p>';
    const columnBreaker = '<!-- columnBreaker -->';
    const htmlColumns = getHtmlColumns(text.body);

    function getHtmlColumns(body = ''): string[] {
        if (columns === 1) {
            return [body];
        }
        if (body.indexOf(legacyColumnBreaker) !== -1) {
            const allHtmlColumns = body.split(legacyColumnBreaker);
            const [first, ...second] = allHtmlColumns;
            return [first, second.join('')];
        }
        if (body.indexOf(columnBreaker) !== -1) {
            const allHtmlColumns = body.split(columnBreaker);
            const [first, ...second] = allHtmlColumns;
            return [first, second.join('')];
        }
        return [body];
    }

    return (
        <div
            className={clsx(
                'has-text-columns',
                {
                    'text-alignment--center': textAlignment === 'center',
                    'columns--2': columns === 2,
                    'autobreak': htmlColumns.length === 1,
                },
            )}>
            <div className="content-wrapper">
                {text.heading && (
                    <Heading level={2} size={headingSize || 'md'} className="heading">{text.heading}</Heading>
                )}
                {htmlColumns.length > 1 ? (
                    <div className="body">
                        {htmlColumns.map((htmlColumn, index) => (
                            <div key={index} className="column" dangerouslySetInnerHTML={{ __html: htmlColumn }}></div>
                        ))}
                    </div>
                ) : (
                    <div className="body" dangerouslySetInnerHTML={{ __html: htmlColumns[0] }}></div>
                )}
            </div>
        </div>
    );
}
