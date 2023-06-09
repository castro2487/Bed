import React, { createRef } from 'react';
import Grid from '@material-ui/core/Grid';
import dayjs from 'dayjs';

import './StoreInfo.scss';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { GoogleMap } from '../../../shared/components/GoogleMap';
import { useServer } from '../../server/ServerProvider';
import { capitalizeFirstLetter, getScheduleWithDeviations, StoreHours } from './helper';
import { Address, formatAddress } from '../../../shared/helpers';


interface StoreContent {
    store: {
        name: string;
        address: Address;
        email: string;
        phone: string;
        storeHours: StoreHours;
        latitude: string;
        longitude: string;
        facebookUrl: string;
        instagramUrl: string;
        description?: string;
    };
    config: {
        apiKey: string;
        facebookUrl: string;
        instagramUrl: string;
        youtubeUrl: string;
    };
    text: {
        address: string;
        email: string;
        phone: string;
        openingHours: string;
        information: string;
        informationBody: string;
        direction: string;
        closed: string;
    };
}

export function StoreInfo() {
    const { content: { store, config, text } } = useServer<StoreContent>();
    const componentRef = createRef<any>();
    const schedule = getScheduleWithDeviations(store.storeHours);
    const storeAddress = formatAddress(store.address);

    return (
        <div className="has-partner-page-store-info">
            <div ref={componentRef} className="map">
                <GoogleMap
                    id="partnerPageMap"
                    mapKey={config.apiKey}
                    options={{
                        center: { lat: store.latitude, lng: store.longitude },
                        zoom: 8,
                    }}
                    onMapLoad={(map) => {
                        new window.google.maps.Marker({
                            position: { lat: store.latitude, lng: store.longitude },
                            map,
                        });
                    }}
                />
            </div>
            <div className="info">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={4} className="info-block address-block">
                        <h3>{text.address}</h3>
                        <address>
                            <Paragraph size="sm" className="font-weight-bold m-0 mt-1">{store.name}</Paragraph>
                            <Paragraph size="sm">
                                <strong className="sr-only">{text.address}</strong>
                                {storeAddress}
                            </Paragraph>
                            <Paragraph size="sm" className="font-weight-bold m-0 mt-1">{text.email}:</Paragraph>
                            <Paragraph size="sm" className="mb-0">
                                <a id="#email" title={store.email} href={`mailto:${store.email}`} target="_self">
                                    {store.email}
                                </a>
                            </Paragraph>
                            <Paragraph size="sm" className="font-weight-bold m-0 mt-1">{text.phone}:</Paragraph>
                            <Paragraph size="sm">
                                <span title={store.phone}>{store.phone}</span>
                            </Paragraph>
                        </address>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} className="info-block">
                        <Heading level={3} size="xs">{text.openingHours}</Heading>
                        <div className="d-table opening-hours">
                            {schedule.map((scheduleItem, index) => (
                                <div key={index} className="mb-1 d-table-row">
                                    <Paragraph size="sm" className="d-table-cell text-left" title={dayjs(scheduleItem.date, 'YYYY-MM-DD').format('L')}>
                                        {capitalizeFirstLetter(dayjs(scheduleItem.date, 'YYYY-MM-DD').format('dddd'))}
                                    </Paragraph>
                                    {scheduleItem.hours.length ? (
                                        <Paragraph size="sm" className="d-table-cell text-left">
                                            {scheduleItem.hours.map((hour, hourIndex) => (
                                                <span key={hourIndex} className="d-block">
                                                    {`${dayjs(hour.open, 'HH:mm').format('LT')} - ${dayjs(hour.close, 'HH:mm').format('LT')}`}
                                                </span>
                                            ))}
                                        </Paragraph>
                                    ) : (
                                        <Paragraph size="sm" className="d-table-cell text-left text-danger">
                                            {text.closed}
                                        </Paragraph>
                                    )}
                                </div>
                            ))}
                        </div>
                        {store.storeHours?.info && <Paragraph size="xs">{store.storeHours.info}</Paragraph>}
                    </Grid>
                    <Grid item xs={12} lg={4} className="info-block">
                        <Heading level={3} size="xs">{text.information}</Heading>
                        {store.description && <Paragraph size="sm">{store.description}</Paragraph>}
                        <Paragraph size="sm">{text.informationBody}</Paragraph>
                        <div className="social-icons">
                            <a href={store.facebookUrl || config.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa fa-facebook icon-rounded"></i></a>
                            <a href={store.instagramUrl || config.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"> <i className="fa fa-instagram icon-rounded"></i> </a>
                            <a href={config.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Youtube"><i className="fa fa-youtube icon-rounded"></i></a>
                            <div className="directions mt-3">
                                <a href={`https://maps.google.com/?daddr=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer">
                                    <i className="fa fa-location-arrow icon-rounded"></i> {text.direction}
                                </a>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div >
        </div>
    );
}
