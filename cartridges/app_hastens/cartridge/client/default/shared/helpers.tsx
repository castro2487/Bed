import React, { Fragment, ReactNode, useRef } from 'react';
import { PhoneNumber } from 'libphonenumber-js/core';
import * as localizedAddressFormat from 'localized-address-format';
import isNumber from 'lodash/isNumber';
import { Image, ScaleWidth } from '../blocks/server/ServerProvider';

export interface Address {
    countryCode: string;
    address1: string;
    address2: string;
    city: string;
    stateCode: string;
    postalCode: string;
    displayAddress: string;
}

let libphonenumber;

export function convertToInt(value): number {
    return parseInt(value, 10) || 0;
}

export function convertToFloat(value): number {
    return parseFloat(value) || 0;
}

export function createExcerpt(text: string): string {
    let excerpt = text ? text.replace(/(<([^>]+)>)/gi, '') : '';

    if (excerpt.length > 180) {
        excerpt = excerpt.substr(0, 180);
        excerpt = excerpt.substr(0, excerpt.lastIndexOf(' '));
        return `${excerpt}...`;
    } else {
        return excerpt;
    }
}

export function isIOS(): boolean {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
    ].includes(navigator.platform);
}

export function isIE(): boolean {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');
    const trident = ua.indexOf('Trident/');

    if (msie > 0 || trident > 0) {
        return true;
    }

    return false;
}

export function parsePhoneNumberFromString(text: string): Promise<PhoneNumber> {
    if (!libphonenumber) {
        libphonenumber = import(/* webpackChunkName: "libphonenumber-js" */ 'libphonenumber-js/max');
    }
    return libphonenumber.then((lib) => {
        return lib.parsePhoneNumberFromString(text);
    });
}

type BookBedEvent = 'bookBedTestStartEvent' | 'bookBedTestEndEvent';
type CatalogRequestEvent = 'catalogRequestEndEvent' | 'catalogRequestStartEvent';
type BedConfiguratorEvent = 'bedConfiguratorStartEvent' | 'bedConfiguratorEndEvent' | 'bedConfiguratorToSummaryEvent';
type VideoSubscriptionEvent = 'videoSubscriptionStartEvent' | 'videoSubscriptionEndEvent';
type NewsletterSubscriptionEvent = 'newsletterSubscriptionStartEvent' | 'newsletterSubscriptionEndEvent';
type KruxEventName = BedConfiguratorEvent | BookBedEvent | CatalogRequestEvent | VideoSubscriptionEvent | NewsletterSubscriptionEvent;
export function sfmcEvent(eventName: KruxEventName, arg = {}): void {
    const keys = {
        bedConfiguratorStartEvent: 'NdbJkdta',
        bedConfiguratorEndEvent: 'NdbItJjY',
        bookBedTestStartEvent: 'NK4Eynr7',
        bookBedTestEndEvent: 'NK4FGc9C',
        videoSubscriptionStartEvent: 'NdbP-LSt',
        videoSubscriptionEndEvent: 'NdbQaWCY',
        catalogRequestStartEvent: 'NK4EGAdo',
        catalogRequestEndEvent: 'NK4Eh1QS',
        bedConfiguratorToSummaryEvent: 'NxQrYHD3',
        newsletterSubscriptionStartEvent: 'Ney03F5_',
        newsletterSubscriptionEndEvent: 'Ney1QNIA',
    };
    if (typeof Krux !== 'undefined') {
        Krux('ns:hastens', 'admEvent', keys[eventName], { event_type: 'default', ...arg });
    }
}

export type GTMEventName = 'requestACatalog' | 'signUpForNewsLetter' | 'Bedconfiguratorcompleted' | 'Bedconfiguratorrequestaquote' |
    'storeLocatorSendVisitRequest' | 'Newbusinessdevelopmentformsubmit' | 'GrandVividusjointhewaitlist' | 'Video25' | 'Video50' | 'Video75' | 'Video100';

export function gtmEvent(eventName: GTMEventName) {
    // tslint:disable-next-line:no-string-literal
    window['dataLayer'].push({ event: eventName });
}

export function hasImage(image: Image) {
    if (!image) {
        return false;
    }
    return Object.values(image.sizes).every((value) => value);
}

const defaultScaleWidth = {
    mobile: ScaleWidth.W768,
    tablet: ScaleWidth.W1200,
    desktop: ScaleWidth.W1500,
};

const defaultRetinaScaleWidth = {
    mobile: ScaleWidth.W1536,
    tablet: ScaleWidth.W2400,
    desktop: ScaleWidth.W2880,
};

export function getFullImageUrl(src, scaleWidth, device, enableHighResolution = false): URL {
    const url = new URL(src);
    if (!url.hostname.startsWith('static')) {
        if (scaleWidth === true) {
            url.searchParams.append('sw', getDefaultScaleWidth(device, enableHighResolution).toString());
        } else if (isNumber(scaleWidth)) {
            url.searchParams.append('sw', scaleWidth.toString());
        }
    }
    return url;
}

function getDefaultScaleWidth(device, enableHighResolution): number {
    if (enableHighResolution) {
        return defaultRetinaScaleWidth[device];
    }
    return defaultScaleWidth[device];
}

export function usePrevious<T = any>(value: T): T {
    const ref = useRef<{previous: T, next: T}>({ previous: undefined, next: value });
    if (ref.current.next !== value) {
        ref.current.previous = ref.current.next;
        ref.current.next = value;
    }
    return ref.current.previous;
}

export function delay(duration): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration);
    });
}

export function addSups(text = ''): ReactNode {
    const regexp = new RegExp(/(®)/g);
    const parts = text.split(regexp);
    return parts.map((part, index) => {
        if (part.match(regexp)) {
            return <sup key={index}>{part}</sup>;
        }
        return <Fragment key={index}>{part}</Fragment>;
    });
}

export function __(translationCode: string): string {
    const translations = window.hastens_globals.translatedStrings;

    if (translations.hasOwnProperty(translationCode)) {
        return translations[translationCode];
    }

    return translationCode;
}

export function shouldScrollIntoView(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < 0 && rect.top + rect.height > 0;
}

export function scrollIntoView(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        let scrollTimeout;
        // Listen to scroll event to determine if the animation has stopped
        window.addEventListener('scroll', handleScroll);
        element.scrollIntoView({ block: 'start', behavior: 'smooth' });

        setTimeout(() => {
            handleScroll();
        }, 100);

        function handleScroll() {
            if (scrollTimeout) {
                window.clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                resolve();
                window.removeEventListener('scroll', handleScroll);
            }, 100);
        }
    });
}

export function formatAddress(address: Address): string {
    if (address.displayAddress && (!address.address1 || !address.city)) {
        return address.displayAddress;
    }
    return localizedAddressFormat.formatAddress({
        postalCountry: address.countryCode,
        addressLines: [address.address1, address.address2],
        postalCode: address.postalCode,
        administrativeArea: address.stateCode,
        locality: address.city,
    }).join(', ');
}
