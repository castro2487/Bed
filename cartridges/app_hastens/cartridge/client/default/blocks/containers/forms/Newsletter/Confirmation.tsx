import './Confirmation.scss';

import React, { ReactElement } from 'react';

import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { useServer } from '../../../server/ServerProvider';
import { NewsletterContent } from './Newsletter';
import { StringHelper } from '../../../../shared/components/StringHelper';
import { baseClass as requestCatalogBaseClass } from '../../../../shared/components/RequestCatalog/RequestCatalog';
import Link from '../../../../shared/components/Link';
import { requestCatalogBlockId } from '../RequestCatalog/RequestCatalog';

interface Props {
    email: string;
}

export function Confirmation(props: Props): ReactElement {

    const server = useServer<NewsletterContent>();

    function getRequestCatalogElement() {
        return document.querySelector(`.${requestCatalogBaseClass}`);
    }

    return (
        <div className="has-newsletter-confirmation">
            <div className="content-wrapper">
                <h2>{server.content.text.confirmationHeading}</h2>
                <Paragraph>
                    <StringHelper
                        parameters={[
                            <b key="email">{props.email}</b>,
                        ]}>
                        {server.content.text.confirmationMessage}
                    </StringHelper>
                </Paragraph>
                <Paragraph>
                    {server.content.text.getACatalog}&#32;
                    <Link
                        href={`${server.content.fallbackRequestCatalogUrl}#${requestCatalogBlockId}`}
                        onClick={(event) => {
                            const requestCatalogElement = getRequestCatalogElement();
                            if (requestCatalogElement) {
                                event.preventDefault();
                                requestCatalogElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
                            }
                        }}>
                        {server.content.text.getACatalogLinkText}
                    </Link>
                </Paragraph>
            </div>
        </div>
    );

}
