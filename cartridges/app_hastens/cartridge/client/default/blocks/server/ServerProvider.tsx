import React, { createContext, useContext, useEffect, useState } from 'react';
import { CatalogService } from './CatalogService';
import { LocationService } from './LocationService';
import { MarketingCampaignService } from './MarketingCampaignService';
import { BaseService } from './BaseService';
import { NewsletterService } from './NewsletterService';
import { BedOrderService } from './BedOrderService';
import { PartnerService } from './PartnerService';
import { CollaborationService } from './CollaborationService';
import PrivateSessionService from './PrivateSessionService';
import { Snackbar } from '../../shared/components/Snackbar';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';

export interface ServerProps<C> {
    blockId: string;
    parentId: string;
    scaleWidthRecommendation: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    shouldDisableBedConfigurator: boolean;
    content: C;
    contentBlocks: {
        type: string;
        content: any;
    }[];
    locale: string;
    pageId: string;
    baseService: BaseService;
    catalogService: CatalogService;
    locationService: LocationService;
    marketingCampaignService: MarketingCampaignService;
    newsletterService: NewsletterService;
    bedOrderService: BedOrderService;
    partnerService: PartnerService;
    collaborationService: CollaborationService;
    privateSessionService: PrivateSessionService;
    getTrackingClassId: (str1: string, str2?: string) => string;
    alertError: (message?: string) => void;
    getAllowedCountry: (allowedCountries?: string[]) => string;
}

export interface Image {
    sizes: ImageSizes;
    alt?: string;
}

export interface ImageSizes {
    mobile: ImageSize;
    tablet: ImageSize;
    desktop: ImageSize;
}

export interface ImageSize {
    src: string;
    focalPoint?: FocalPoint;
    height?: number;
    width?: number;
}

export interface FocalPoint {
    x: number;
    y: number;
}

// These are the available image sizes in Image manager. More sizes can be added if needed.
export enum ScaleWidth {
    W35 = 35,
    W140 = 140,
    W400 = 400,
    W500 = 500,
    W750 = 750,
    W768 = 768,
    W800 = 800,
    W1100 = 1100,
    W1200 = 1200,
    W1500 = 1500,
    W1536 = 1536,
    W2400 = 2400,
    W2880 = 2880,
}

export interface Link {
    text: string;
    url: string;
    disablePageReload?: boolean;
}

export type VerticalAlignment = 'top' | 'center' | 'bottom';
export type HorizontalAlignment = 'left' | 'center' | 'right';

export type Theme = 'primary-1' | 'purple-1' | 'black-1' | 'white-1' | 'grey-1' | 'grey-2' | 'grey-3' | 'grey-4';

export interface CustomTheme {
    backgroundColor: string;
    color: string;
}

export const ServerContext = createContext(null);

export function ServerProvider({ blockId, parentId, trackingId, scaleWidthRecommendation, shouldDisableBedConfigurator, content, contentBlocks, children, locale, pageId, services }) {
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handlerId = services.baseService.registerErrorHandler((message) => {
            setOpen(true);
            setErrorMessage(message);
        });
        return () => {
            services.baseService.unregisterErrorHandler(handlerId);
        };
    }, []);

    return (
        <ServerContext.Provider
            value={{
                blockId,
                parentId,
                scaleWidthRecommendation,
                shouldDisableBedConfigurator,
                contentBlocks,
                content,
                locale,
                pageId,
                ...services,
                getTrackingClassId: (...params: string[]) => {
                    // This classname is used for google analytics and must never be changed
                    if (params.length === 2) {
                        return `tid-${params[0]}-${params[1]}`;
                    }
                    return `tid-${trackingId}-${params[0]}`;
                },
                alertError: (message = '') => {
                    setOpen(true);
                    setErrorMessage(message);
                },
                getAllowedCountry: (allowedCountries: string[] = []) => {
                    const localeCode = locale.toUpperCase();
                    const countryCode = localeCode.split(/[-_]/)[1] || localeCode;

                    return allowedCountries.length > 0 ? (allowedCountries.includes(countryCode) ? countryCode : 'GB') : countryCode;
                },
            } as ServerProps<any>}>
            <ErrorBoundary
                onError={() => {
                    setOpen(true);
                    setErrorMessage('');
                }}>
                {children}
            </ErrorBoundary>
            <Snackbar
                open={open}
                message={errorMessage}
                severity="error"
                onClose={() => {
                    setOpen(false);
                }}
            />
        </ServerContext.Provider>
    );
}

export function useServer<C = unknown>(): ServerProps<C> {
    return useContext(ServerContext);
}
