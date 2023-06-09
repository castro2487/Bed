import './News.scss';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { useServer } from '../../server/ServerProvider';
import { WPContentFallback, WPContent } from './WPContent';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { isIE } from '../../../shared/helpers';

export interface NewsContent {
    text: {
        posted: string;
    };
    items: {
        title: {
            rendered: string;
        };
        content: {
            rendered: string;
        };
        excerpt: {
            rendered: string;
        };
        date: string;
        featured_image: string;
    }[];
}

const useDialogStyles = makeStyles({
    paper: {
        maxWidth: 800,
        margin: 15,
    },
});

export function News() {

    const server = useServer<NewsContent>();
    const [activeItemIndex, setActiveItemIndex] = useState(-1);
    const dialogStyles = useDialogStyles();

    const activeItem = server.content.items[activeItemIndex];
    const ie = isIE();

    return [(
        <div key="news" className="has-news">
            <div className="content-wrapper">
                <div className="columns">
                    {server.content.items.map((item, index) => (
                        <article key={index} className="news-item" onClick={() => {setActiveItemIndex(index);}}>
                            {item.featured_image ? (
                                <div className="image" style={{ backgroundImage: `url(${item.featured_image})` }}></div>
                            ) : (
                                <div className="placeholder"></div>
                            )}
                            <div className="text">
                                <h2 className="heading" dangerouslySetInnerHTML={{ __html: item.title.rendered }}></h2>
                                <p className="date">{server.content.text.posted}: {dayjs(item.date).format('YYYY-MM-DD')}</p>
                                <Paragraph size="sm" className="excerpt" dangerouslySetInnerHTML={{ __html: item.excerpt.rendered }}></Paragraph>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    ), (
        <Dialog
            key="dialog"
            className={clsx('has-news-dialog', ie ? 'browser--ie' : null)}
            classes={dialogStyles}
            open={activeItemIndex !== -1}
            onClose={() => {setActiveItemIndex(-1);}}>
            <button className="close-button" aria-label="Close" onClick={() => {setActiveItemIndex(-1);}}>
                <i className="fa fa-times"></i>
            </button>
            {ie ? (
                <WPContentFallback>{activeItem ? activeItem.content.rendered : null}</WPContentFallback>
            ) : (
                <WPContent>{activeItem ? activeItem.content.rendered : null}</WPContent>
            )}
        </Dialog>
    )];

}
