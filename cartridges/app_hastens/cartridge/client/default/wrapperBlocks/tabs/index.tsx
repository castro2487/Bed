import './main.scss';

import pushState from '../../shared/helpers/pushState';

const tabAttribute = 'data-hastens-tab';
const tabRegionAttribute = 'data-hastens-tab-region';

const tabs = document.querySelectorAll<HTMLElement>(`[${tabAttribute}]`);
const tabRegions = document.querySelectorAll<HTMLElement>(`[${tabRegionAttribute}]`);

const fallbackTitle = window.document.title;

validateSlug();
updateView();

window.addEventListener('hastens:pushstate', () => {
    updateView();
});

tabs.forEach((tab) => {
    const slug = tab.getAttribute(tabAttribute);
    const params = new URLSearchParams(location.search);
    params.set('t', slug);
    const href = `${location.pathname}?${params.toString()}`;
    tab.setAttribute('href', href);
    tab.addEventListener('click', (event) => {
        event.preventDefault();
        pushState(href);
    });
});

function validateSlug() {
    const params = new URLSearchParams(location.search);
    const activeSlug = params.get('t');
    let match = false;
    tabs.forEach((tab) => {
        const slug = tab.getAttribute(tabAttribute);
        if (slug === activeSlug) {
            match = true;
        }
    });
    if (!match) {
        params.set('t', tabs[0].getAttribute(tabAttribute));
        pushState(`${location.pathname}?${params.toString()}`);
    }
}

function updateView() {
    const params = new URLSearchParams(location.search);
    const activeSlug = params.get('t');
    tabs.forEach((tab) => {
        const slug = tab.getAttribute(tabAttribute);
        if (slug === activeSlug) {
            tab.classList.add('active');
            window.document.title = tab.getAttribute('data-title') || fallbackTitle;
        } else {
            tab.classList.remove('active');
        }
    });
    tabRegions.forEach((tabRegion) => {
        const slug = tabRegion.getAttribute(tabRegionAttribute);
        if (slug === activeSlug) {
            tabRegion.classList.add('active');
            tabRegion.setAttribute('aria-hidden', 'false');
        } else {
            tabRegion.classList.remove('active');
            tabRegion.setAttribute('aria-hidden', 'true');
        }
    });
}
