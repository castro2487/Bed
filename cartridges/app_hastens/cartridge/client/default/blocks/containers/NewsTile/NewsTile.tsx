import './NewsTile.scss';

import React, { lazy, Suspense, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';

import { Image, useServer } from '../../server/ServerProvider';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { Button } from '../../../shared/components/formFields/Button';
import { createExcerpt } from '../../../shared/helpers';
import { Background } from '../../../shared/components/Background';

export interface NewsTileContent {
    heading: string;
    body: string;
    media: {
        image: Image;
        video: string;
    }[];
    text: {
        readMore: string;
    };
}

const useDialogStyles = makeStyles({
    paper: {
        maxWidth: 473,
        maxHeight: 'calc(100% - 20px)',
        margin: 10,
    },
});

const DialogContent = lazy(() => import(/* webpackChunkName: "news-tile-dialog-content" */ './DialogContent').then((module) => ({ default: module.DialogContent })));

export function NewsTile() {

    const { content, scaleWidthRecommendation } = useServer<NewsTileContent>();
    const [isOpen, setIsOpen] = useState(false);
    const dialogStyles = useDialogStyles();
    const excerpt = createExcerpt(content.body);
    const featuredMedia = content.media[0];

    return [(
        <article key="news-tile" className="has-news-tile">
            {featuredMedia ? (
                <Background image={featuredMedia.image} scaleWidth={scaleWidthRecommendation}>
                    <div className="image-spacer" onClick={() => {setIsOpen(true);}}></div>
                </Background>
            ) : (
                <div className="placeholder" onClick={() => {setIsOpen(true);}}></div>
            )}
            <div className="text">
                <h2 className="heading">{content.heading}</h2>
                <Paragraph size="sm" className="excerpt">{excerpt}</Paragraph>
                <Button className="dialog-button" size="medium" color="dark" onClick={() => {setIsOpen(true);}}>{content.text.readMore}</Button>
            </div>
        </article>
    ), (
        <Dialog
            key="dialog"
            className="has-news-tile--dialog experience-dialog"
            classes={dialogStyles}
            open={isOpen}
            maxWidth={false}
            onClose={() => {setIsOpen(false);}}>
            <button className="close-button" aria-label="Close" onClick={() => {setIsOpen(false);}}>
                <i className="fa fa-times"></i>
            </button>
            <Suspense fallback={null}>
                <DialogContent
                    heading={content.heading}
                    body={content.body}
                    media={content.media}
                />
            </Suspense>
        </Dialog>
    )];

}
