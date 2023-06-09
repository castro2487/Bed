import './Confirmation.scss';

import React, { ReactElement } from 'react';

import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { StringHelper } from '../../../../shared/components/StringHelper';
import Link from '../../../../shared/components/Link';
import { requestCatalogBlockId } from '../../forms/RequestCatalog/RequestCatalog';
import { __ } from '../../../../shared/helpers';

interface Props {
    email: string;
    fallbackRequestCatalogUrl: string;
}

export function Confirmation(props: Props): ReactElement {

    return (
        <div className="has-newsletter-confirmation">
            <div className="content-wrapper">
                <h2>{__('newsletter.confirmation.heading')}</h2>
                <Paragraph>
                    <StringHelper
                        parameters={[
                            <b key="email">{props.email}</b>,
                        ]}>
                        {__('newsletter.confirmation.message')}
                    </StringHelper>
                </Paragraph>
                <Paragraph>
                    {__('newsletter.getacatalog')}&#32;
                    <Link href={`${props.fallbackRequestCatalogUrl}#${requestCatalogBlockId}`}>
                        {__('newsletter.getacataloglinktext')}
                    </Link>
                </Paragraph>
            </div>
        </div>
    );

}
