import './styles/main.scss';

import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import uniqueId from 'lodash/uniqueId';
import isArray from 'lodash/isArray';

import 'dayjs/locale/en-gb';
import 'dayjs/locale/cs';
import 'dayjs/locale/da';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fi';
import 'dayjs/locale/fr';
import 'dayjs/locale/is';
import 'dayjs/locale/it';
import 'dayjs/locale/ko';
import 'dayjs/locale/lt';
import 'dayjs/locale/lv';
import 'dayjs/locale/nb';
import 'dayjs/locale/nl';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/sk';
import 'dayjs/locale/sv';
import 'dayjs/locale/tr';
import 'dayjs/locale/zh';

import * as components from './exports';
import { ServerProvider } from './server/ServerProvider';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { lightTheme } from '../shared/muiTheme';

import { CatalogService } from './server/CatalogService';
import { LocationService } from './server/LocationService';
import { MarketingCampaignService } from './server/MarketingCampaignService';
import { BaseService } from './server/BaseService';
import { NewsletterService } from './server/NewsletterService';
import { BedOrderService } from './server/BedOrderService';
import { PartnerService } from './server/PartnerService';
import { CollaborationService } from './server/CollaborationService';
import PrivateSessionService from './server/PrivateSessionService';
import { scrollIntoView } from '../shared/helpers';

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

/**
 * Render blocks
 */

const wrapperBlockAttribute = 'data-hastens-wrapper-block';
const blockAttribute = 'data-hastens-block';
const contentBlockAttribute = 'data-hastens-content-block';

const wrapperBlocks = document.querySelectorAll<HTMLElement>(`[${wrapperBlockAttribute}]`);

wrapperBlocks.forEach((wrapperBlock) => {
    const containerData = wrapperBlock.getAttribute(wrapperBlockAttribute);
    const serverProps = containerData ? JSON.parse(containerData) : {};
    const containerClass = serverProps.containerClass;

    if (containerClass) {
        containerClass.forEach((className) => {
            wrapperBlock.parentElement.classList.add(className);
        });
    }

    const wrapperBlockId = uniqueId('b-');
    const childBlocks = wrapperBlock.querySelectorAll<HTMLElement>(`[${blockAttribute}]`);
    wrapperBlock.setAttribute('id', wrapperBlockId);

    childBlocks.forEach((block, index) => {
        renderBlock(block, serverProps, wrapperBlockId, index);
    });

    // Remove data attribute so that it doesn't clutter the dom
    wrapperBlock.removeAttribute(wrapperBlockAttribute);
});

const blocks = document.querySelectorAll<HTMLElement>(`[${blockAttribute}]`);

blocks.forEach((block) => {
    renderBlock(block, {}, null, null);
});

function renderBlock(block, parentContent, parentId, index) {
    const containerData = block.getAttribute(blockAttribute);
    const serverProps = containerData ? JSON.parse(containerData) : {};
    const scaleWidthRecommendation = isArray(parentContent.scaleWidthRecommendation) ? parentContent.scaleWidthRecommendation[index] : parentContent.scaleWidthRecommendation;
    const blockId = serverProps.blockId;
    const contentBlocks = getContentBlocks(block);
    const Component = components[serverProps.type];
    const baseService = new BaseService(serverProps.backendUrl);
    const dayjsLocale = getDayjsLocale(serverProps.locale);
    dayjs.locale(dayjsLocale);

    const containerClass = serverProps.containerClass;
    if (containerClass) {
        containerClass.forEach((className) => {
            block.parentElement.classList.add(className);
        });
    }
    // Tell webpack which url to use when lazyloading
    __webpack_public_path__ = serverProps.staticUrl;

    if (Component) {
        render(
            <ErrorBoundary>
                <ServerProvider
                    {...serverProps}
                    blockId={blockId}
                    scaleWidthRecommendation={scaleWidthRecommendation}
                    parentId={parentId}
                    contentBlocks={contentBlocks}
                    locale={serverProps.locale}
                    services={{
                        baseService,
                        catalogService: new CatalogService(baseService),
                        locationService: new LocationService(baseService),
                        marketingCampaignService: new MarketingCampaignService(baseService),
                        newsletterService: new NewsletterService(baseService),
                        bedOrderService: new BedOrderService(baseService),
                        partnerService: new PartnerService(baseService),
                        collaborationService: new CollaborationService(baseService),
                        privateSessionService: new PrivateSessionService(baseService),
                    }}>
                    <ThemeProvider theme={lightTheme}>
                        <MuiPickersUtilsProvider utils={DayjsUtils} locale={dayjsLocale}>
                            <Component />
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                </ServerProvider>
            </ErrorBoundary>,
            block,
        );
    }
    // Remove data attribute so that it doesn't clutter the dom
    block.removeAttribute(blockAttribute);
}

function getDayjsLocale(locale) {
    switch (locale) {
        case 'en_en':
        case 'en_LU':
        case 'en_NL':
            return 'en-gb';
        case 'cs_CZ':
            return 'cs';
        case 'da_DK':
            return 'da';
        case 'de_DE':
        case 'de_AT':
        case 'de_BE':
        case 'de_CH':
        case 'de_LU':
            return 'de';
        case 'es_ES':
            return 'es';
        case 'fi_FI':
            return 'fi';
        case 'fr_FR':
        case 'fr_BE':
        case 'fr_CH':
        case 'fr_LU':
            return 'fr';
        case 'is_IS':
            return 'is';
        case 'it_IT':
        case 'it_CH':
            return 'it';
        case 'ko_KR':
            return 'ko';
        case 'lt_LT':
            return 'lt';
        case 'lv_LV':
            return 'lv';
        case 'nl_NL':
        case 'nl_BE':
            return 'nl';
        case 'no_NO':
            return 'nb';
        case 'pl_PL':
            return 'pl';
        case 'pt_PT':
            return 'pt';
        case 'ru_RU':
        case 'ru_LT':
        case 'ru_LV':
            return 'ru';
        case 'sk_SK':
            return 'sk';
        case 'sv_FI':
        case 'sv_SE':
            return 'sv';
        case 'tr_TR':
            return 'tr';
        case 'zh_CN':
            return 'zh';
        default:
            return 'en-gb';
    }
}

function getContentBlocks(block: HTMLElement) {
    const contentElements = block.querySelectorAll<HTMLElement>(`[${contentBlockAttribute}]`);
    const contentBlocks = [];

    contentElements.forEach((contentElement) => {
        const containerData = contentElement.getAttribute(contentBlockAttribute);
        const serverProps = containerData ? JSON.parse(containerData) : {};
        contentBlocks.push(serverProps);
    });

    return contentBlocks;
}

/**
 * Add tabbing class for removing outlines when not needed
 */

window.addEventListener('keydown', (event) => {
    if (event.keyCode === 9) {
        window.document.body.classList.add('tabbing');
    }
});

window.addEventListener('click', () => {
    window.document.body.classList.remove('tabbing');
});

/**
 * Let css know the javascript has loaded
 */

document.body.classList.remove('has-loading-js');

/**
 * Bugfix: Anchor links stop working in Chrome when not accepting all cookies in the Cookiebot
 */

if (navigator.userAgent.indexOf('Chrome') !== -1) {
    if (window.Cookiebot.hasResponse === true) {
        const consentedAll = ['marketing', 'necessary', 'preferences', 'statistics'].every((consentKey) => window.Cookiebot.consent[consentKey] === true);
        if (consentedAll === false) {
            window.addEventListener('DOMContentLoaded', applyCookiebotBugfix);
        }
    } else {
        window.addEventListener('DOMContentLoaded', applyCookiebotBugfix);
    }
}

function applyCookiebotBugfix() {
    if (window.location.hash) {
        const element = document.querySelector<HTMLElement>(window.location.hash);
        if (element) {
            scrollIntoView(element);
        }
    }
}
