import './PartnerPageFloatingBar.scss';

import React, { useState } from 'react';
import dayjs from 'dayjs';

import { Button } from '../../../shared/components/formFields/Button';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { useServer } from '../../server/ServerProvider';
import { getTodayHours, StoreHours, capitalizeFirstLetter } from './helper';
import { Address, formatAddress } from '../../../shared/helpers';

interface StoreContent {
    store: {
        phone: string;
        latitude: string;
        longitude: string;
        canShow: boolean;
        address: Address,
        storeHours: StoreHours,
    };
    text: {
        phone: string;
        contact: string;
        address: string;
        direction: string;
        buttonText: string;
        openingHour: string;
        closed: string;
    };
}


export function PartnerPageFloatingBar() {
    const [hideMe, setHideMe] = useState(false);
    const { content: { store, text } } = useServer<StoreContent>();
    const today = getTodayHours(store.storeHours);
    const storeAddress = formatAddress(store.address);

    return store.canShow ? (
        <div className={`has-partner-floating-information ${hideMe ? 'd-none' : ''}`}>
            <div className="outer-container">
                <div className="inner-container">
                    <Heading level={3} size="xs">{text.contact}</Heading>
                </div>

                <div className="inner-container">
                    <div>
                        <i className="fa fa-clock-o"></i>
                    </div>
                    <div>
                        <Paragraph size="sm" className="label">{text.openingHour}</Paragraph>
                        <div className="detail">
                            <span className="date">{capitalizeFirstLetter(dayjs(today.date, 'YYYY-MM-DD').format('dddd DD/MM'))}</span>
                            <span className="opening-hours">
                                {today.hours.length ? today.hours.map((hour, hourIndex) => (
                                    <span key={hourIndex} className="d-block">
                                        {`${dayjs(hour.open, 'HH:mm').format('LT')} - ${dayjs(hour.close, 'HH:mm').format('LT')}`}
                                    </span>
                                )) : text.closed}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="inner-container">
                    <div>
                        <i className="fa fa-phone"></i>
                    </div>
                    <div>
                        <Paragraph size="sm" className="label">{text.phone}</Paragraph>
                        <a href={`tel:${store.phone}`} target="_self">{store.phone}</a>
                    </div>
                </div>

                <div className="inner-container">
                    <div>
                        <i className="fa fa-map-marker"></i>
                    </div>
                    <div>
                        <Paragraph size="sm" className="label">{text.address}</Paragraph>
                        <div className="detail">
                            <span>{storeAddress}</span>
                        </div>
                        <a href={`https://maps.google.com/?daddr=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer">
                            {text.direction}
                        </a>
                    </div>
                </div>

                <div className="inner-container">
                    <Button
                        size="small"
                        color="light"
                        onClick={() => setHideMe(true)} className="button action-button">
                        {text.buttonText}
                    </Button>
                </div>
            </div>
        </div>
    ) : null;

}
