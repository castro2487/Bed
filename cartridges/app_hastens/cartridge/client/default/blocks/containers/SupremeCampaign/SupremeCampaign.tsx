import './SupremeCampaign.scss';

import React, { ReactElement, useState } from 'react';
import clsx from 'clsx';

import { useServer, Link, Image } from '../../server/ServerProvider';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { StringHelper } from '../../../shared/components/StringHelper';
import { PopupVideo } from '../../../shared/components/video/PopupVideo';

interface LargeCTAContent {
    link: Link;
    text: {
        heading: string;
        body: string;
        footer1: string;
        footer2: string;
        footer3: string;
    };
    contactEmail: string;
    video: string;
    videoImage: Image;
}

const viewInARButtonHtml = `
    <button
        onclick="activateAR(this)"
        data-desktopqr
        data-androidsrc="https://cdn2.charpstar.net/hastens/hastens-supreme-maranga-180x210.glb"
        data-iossrc="https://cdn2.charpstar.net/hastens/hastens-supreme-maranga-180x210.usdz"
    />
`;

const modelViewerHtml = `
    <model-viewer
        reveal="auto"
        max-field-of-view="32deg"
        src="https://cdn2.charpstar.net/hastens/hastens-supreme-maranga-180x210.glb"
    />
`;

export default function SupremeCampaign(): ReactElement {
    const { content, scaleWidthRecommendation, getTrackingClassId } = useServer<LargeCTAContent>();
    const [modelViewerIsActive, setModelViewerIsActive] = useState(false);

    return (
        <div className="has-supreme-campaign">
            {modelViewerIsActive ? (
                <div className="mv-view">
                    <div className="button-wrapper">
                        <div className="view-in-ar-button" dangerouslySetInnerHTML={{ __html: viewInARButtonHtml }} />
                        <button
                            className="close-3d-button"
                            onClick={() => {
                                setModelViewerIsActive(false);
                            }}
                        />
                    </div>
                    <div className="model-viewer" dangerouslySetInnerHTML={{ __html: modelViewerHtml }} />
                </div>
            ) : (
                <div className="initial-view">
                    <div className="button-wrapper">
                        <div className="view-in-ar-button" dangerouslySetInnerHTML={{ __html: viewInARButtonHtml }} />
                        <button
                            className="view-in-3d-button"
                            aria-label="View in 3D"
                            onClick={() => {
                                setModelViewerIsActive(true);
                            }}
                        />
                    </div>
                    <a
                        className={clsx('logo', getTrackingClassId('logo-link'))}
                        href={content.link.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={content.link.text}>
                    </a>
                    <div className="image"></div>
                </div>
            )}
            <div className="description">
                <h2>{content.text.heading}</h2>
                <Paragraph size="sm">{content.text.body}</Paragraph>
            </div>
            <h2 className="bottom-text-1">{content.text.footer1}</h2>
            <Paragraph className="bottom-text-2" size="sm">{content.text.footer3}</Paragraph>
            <PopupVideo
                url={content.video}
                BackgroundProps={{
                    image: content.videoImage,
                    theme: 'black-1',
                    scaleWidth: scaleWidthRecommendation,
                    className: 'supreme-video',
                }}
            />
            <Paragraph className="bottom-text-3" size="sm">
                <StringHelper parameters={[<a key="contactEmail" href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a>]}>{content.text.footer2}</StringHelper>
            </Paragraph>
        </div>
    );
}
