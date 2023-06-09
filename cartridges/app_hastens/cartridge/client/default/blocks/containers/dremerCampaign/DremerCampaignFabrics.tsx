import './DremerCampaignFabrics.scss';

import React, { Fragment, ReactElement, useState } from 'react';

import { Paragraph } from '../../../shared/components/typography/Paragraph';
import Dialog from '../../../shared/components/dialogs/Dialog';
import { Link, useServer } from '../../server/ServerProvider';
import { StringHelper } from '../../../shared/components/StringHelper';

interface ServerContent {
    heading: string;
    details: string;
    ctaBody: string;
    link: Link;
}

type FabricKey = 'traditionalBlue' | 'blackShadow' | 'phantomCharcoal' | 'naturalShale';

export default function DremerCampaignFabrics(): ReactElement {
    const server = useServer<ServerContent>();
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [active3dView, setActive3dView] = useState<FabricKey>();

    return (
        <Fragment>
            <div className="has-dremer-campaign__fabrics">
                <h2>{server.content.heading}</h2>
                <ul className="fabrics">
                    <li className="black-shadow">
                        <div className="label">
                            Black shadow
                            <button
                                className="view-3d"
                                onClick={() => {
                                    setActive3dView('blackShadow');
                                    setDialogIsOpen(true);
                                }}>
                                <span className="sr-only">View in 3D</span>
                            </button>
                        </div>
                    </li>
                    <li className="traditional-blue">
                        <div className="label">
                            Traditional blue
                            <button
                                className="view-3d"
                                onClick={() => {
                                    setActive3dView('traditionalBlue');
                                    setDialogIsOpen(true);
                                }}>
                                <span className="sr-only">View in 3D</span>
                            </button>
                        </div>
                    </li>
                    <li className="phantom-charcoal">
                        <div className="label">
                            Phantom charcoal
                            <button
                                className="view-3d"
                                onClick={() => {
                                    setActive3dView('phantomCharcoal');
                                    setDialogIsOpen(true);
                                }}>
                                <span className="sr-only">View in 3D</span>
                            </button>
                        </div>
                    </li>
                    <li className="natural-shale">
                        <div className="label">
                            Natural shale
                            <button
                                className="view-3d"
                                onClick={() => {
                                    setActive3dView('naturalShale');
                                    setDialogIsOpen(true);
                                }}>
                                <span className="sr-only">View in 3D</span>
                            </button>
                        </div>
                    </li>
                </ul>
                <Paragraph size="xs" className="details">{server.content.details}</Paragraph>
                <p className="link-text"><StringHelper parameters={[<a key="link" href={server.content.link.url}>{server.content.link.text}</a>]}>{server.content.ctaBody}</StringHelper></p>
            </div>
            <Dialog
                size="fullScreen"
                theme="dark"
                className="has-dremer-campaign__3d-dialog"
                open={dialogIsOpen}
                onClose={() => {
                    setDialogIsOpen(false);
                }}>
                <div dangerouslySetInnerHTML={{ __html: getSketchfabHtml(active3dView) }}></div>
                <div className="corner-square"></div>
            </Dialog>
        </Fragment>
    );
}

function getSketchfabHtml(key: FabricKey): string {
    switch (key) {
        case 'traditionalBlue':
            return '<div class="sketchfab-embed-wrapper"> <iframe title="drēmər 210x210 cm - Traditional Blue" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/640f2af06b984c85858aa510128cd5da/embed?autostart=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0"> </iframe> </div>';
        case 'blackShadow':
            return '<div class="sketchfab-embed-wrapper"> <iframe title="drēmər 210x210 cm - Black Shadow" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/005cac1a700e43b396f0120280bbda36/embed?autostart=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1"> </iframe> </div>';
        case 'phantomCharcoal':
            return '<div class="sketchfab-embed-wrapper"> <iframe title="drēmər 210x210 cm - Phantom Charcoal" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/4d94af8dcb6e48f8bfbbafdab1b5975e/embed?autostart=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1"> </iframe> </div>';
        case 'naturalShale':
            return '<div class="sketchfab-embed-wrapper"> <iframe title="drēmər 210x210 cm - Natural Shale" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/f411ac2ac69646b199ba7f8187fded49/embed?autostart=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1"> </iframe> </div>';
    }
}
