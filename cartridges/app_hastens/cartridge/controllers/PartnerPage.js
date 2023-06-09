'use strict';

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var cache = require('*/cartridge/scripts/middleware/cache');
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var SystemObjectMgr = require('dw/object/SystemObjectMgr');

server.get('Show', consentTracking.consent, cache.applyDefaultCache, server.middleware.https, function (req, res, next) {
    var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
    var storeHelpers = require('*/cartridge/scripts/helpers/storeHelpers');
    var Resource = require('dw/web/Resource');
    var Site = require('dw/system/Site');
    var Logger = require('dw/system/Logger');

    var assets = require('*/cartridge/scripts/assets.js');
    assets.addJs('/js/hastens/blocks.js');
    assets.addCss('/css/hastens/blocks.css');

    var slug = req.querystring.s;
    var store = SystemObjectMgr.querySystemObject('Store', 'custom.pp-slug = {0}', slug);

    if (null === store) {
        Logger.getLogger('hastens', 'partner-slug').warn('Slug: {0}, {1}', slug, JSON.stringify({
            agent: req.httpHeaders.get('user-agent'),
            ip: req.httpHeaders.get('true-client-ip'),
        }));
        res.render('hastens/partnerPageMissing', { slug: slug });
        next();

        return;
    }

    var blocksArray = [];

    /**
     * Slideshow
     */
    blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageSlideShow', {
        store: {
            slideShow: JSON.parse(store.custom['pp-slideshow']),
            canShow: store.custom['pp-slideshow-show'],
        },
        sleepBetterUrl: URLUtils.url('Page-Show', 'cid', 'sleep-better-live-better').toString(),
        text: {
            readMore: Resource.msg('readmore', 'hastens', null),
            header: Resource.msg('sleepbetter.header', 'hastens', null),
            pitchText: Resource.msg('sleepbetter.partnerpitch', 'hastens', null),
        }
    }));

    /**
     * Description
     */
    blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageDescription', {
        store: {
            description: store.custom['pp-description'],
            canShow: true,
            theme: 'primary-1',
        },
    }));

    /**
     * External link
     */
    if (store.custom['pp-external-link-show']) {
        blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageExternalLink', {
            store: {
                canShow: store.custom['pp-external-link-show'],
                details: JSON.parse(store.custom['pp-external-link']),
            },
        }));
    }

    /**
     * Bed configurator
     */
    if (store.custom['pp-bedconfigurator-show']) {
        blocksArray.push(RenderHelper.renderStandardComponent('BedConfigurator', {
            text: {
                bannerHeading: Resource.msg('partner.bedconfigurator.header', 'hastens', null),
                bannerBody: Resource.msg('partner.bedconfigurator.body', 'hastens', null),
                bannerButton: Resource.msg('partner.bedconfigurator.cta', 'hastens', null),
            },
            store: {
                partnerEmail: store.getEmail(),
                partnerSlug: store.custom['pp-slug'],
                customerNumber: store.custom['customer-number'],
                countryCode: store.custom['countryCodeValue'],
            },
            theme: 'black-1',
            image: {
                sizes: {
                    mobile: {
                        src: 'https://static.hastens.com/polo/end-consumer/bed-configurator-mobile.jpg',
                        focalPoint: {
                            x: 50,
                            y: 100,
                        },
                    },
                    tablet: {
                        src: 'https://static.hastens.com/1440/polo/end-consumer/bed-configurator.jpg',
                        focalPoint: {
                            x: 65,
                            y: 0,
                        },
                    },
                    desktop: { src: 'https://static.hastens.com/1440/polo/end-consumer/bed-configurator.jpg' },
                },
            },
        }));
    };

    /**
     * Request a catalog
     */
    blocksArray.push(RenderHelper.renderStandardComponent('RequestCatalog', {
        bannerImage: {
            sizes: {
                desktop: { src: 'https://static.hastens.com/1440/blocks/catalog-request/request-catalog-2400x750.jpg' },
                tablet: { src: 'https://static.hastens.com/1200/blocks/catalog-request/request-catalog-2400x750.jpg' },
                mobile: { src: 'https://static.hastens.com/768/blocks/catalog-request/request-catalog-1200x1900.jpg' },
            },
            alt: Resource.msg('requestcatalog.banner.header', 'hastens', null),
        },
        bannerTheme: 'white-1',
        text: {
            bannerHeading: Resource.msg('requestcatalog.banner.header', 'hastens', null),
            bannerBody: Resource.msg('requestcatalog.banner.body', 'hastens', null),
            bannerButton: Resource.msg('requestcatalog.cta', 'hastens', null),
            formHeader: Resource.msg('requestcatalog.form.header', 'hastens', null),
            formSubHeader: Resource.msg('requestcatalog.form.subheader', 'hastens', null),
            confirmHeader: Resource.msg('requestcatalog.confirm.header', 'hastens', null),
            confirmBody: Resource.msg('requestcatalog.confirm.body', 'hastens', null),
            buttonClose: Resource.msg('buttons.close', 'hastens', null),
            buttonCancel: Resource.msg('buttons.cancel', 'hastens', null),
            buttonSend: Resource.msg('buttons.sendrequest', 'hastens', null),
            labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
            labelLastName: Resource.msg('forms.lastName', 'hastens', null),
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
            labelStreetAddress: Resource.msg('forms.streetaddress', 'hastens', null),
            labelApartment: Resource.msg('forms.apartment', 'hastens', null),
            labelState: Resource.msg('forms.state', 'hastens', null),
            labelCity: Resource.msg('forms.city', 'hastens', null),
            labelCountry: Resource.msg('forms.country', 'hastens', null),
            labelZip: Resource.msg('forms.postcode', 'hastens', null),
            labelLanguage: Resource.msg('forms.language', 'hastens', null),
            labelNewsletter: Resource.msg('forms.newsletter', 'hastens', null),
            labelRequired: Resource.msg('forms.required', 'hastens', null),
            labelConsent: Resource.msg('forms.consent', 'hastens', null),
        },
    }));

    /**
     * Book a private session
     */
    if (store.custom['pp-private-session-show']) {
        blocksArray.push(RenderHelper.renderStandardComponent('PartnerPagePrivateSession', {
            texts: {
                buttonClose: Resource.msg('buttons.close', 'hastens', null),
                buttonCancel: Resource.msg('buttons.cancel', 'hastens', null),
                buttonSendRequest: Resource.msg('buttons.sendrequest', 'hastens', null),
                buttonNext: Resource.msg('buttons.next', 'hastens', null),
                labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
                labelLastName: Resource.msg('forms.lastName', 'hastens', null),
                labelEmail: Resource.msg('forms.email', 'hastens', null),
                labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
                labelRequired: Resource.msg('forms.required', 'hastens', null),
                labelConsent: Resource.msg('forms.consent', 'hastens', null),
                bannerHeading: Resource.msg('privateappointment.banner.heading', 'hastens', null),
                bannerBody: Resource.msg('privateappointment.banner.body', 'hastens', null),
                bannerButton: Resource.msg('privateappointment.banner.button', 'hastens', null),
                formHeading: Resource.msg('privateappointment.form.heading', 'hastens', null),
                formBody: Resource.msg('privateappointment.form.body', 'hastens', null),
                noTimeSlots: Resource.msg('privateappointment.form.notimeslots', 'hastens', null),
                confirmationHeading: Resource.msg('privateappointment.confirmation.heading', 'hastens', null),
                confirmationBody: Resource.msg('privateappointment.confirmation.body', 'hastens', null),
            },
            store: {
                partnerSlug: store.custom['pp-slug'],
            },
        }));
    }

    /**
     * Employees
     */
    if (store.custom['pp-employees-show']) {
        blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageTeam', {
            members: JSON.parse(store.custom['pp-employees']),
            showEmployees: store.custom['pp-employees-show'],
            text: {
                header: Resource.msg('partner.teamheader', 'hastens', null),
                body: Resource.msg('partner.teambody', 'hastens', null),
            }
        }));
    }

    /**
     * Quote
     */
    if (store.custom['pp-quote-show']) {
        blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageDescription', {
            store: {
                description: store.custom['pp-quote'].toString(),
                canShow: store.custom['pp-quote-show'],
                theme: 'primary-1',
                image: {
                    sizes: {
                        mobile: { src: 'https://static.hastens.com/partner/bluecheck_parallax.png' },
                        tablet: { src: 'https://static.hastens.com/partner/bluecheck_parallax.png' },
                        desktop: { src: 'https://static.hastens.com/partner/bluecheck_parallax.png' },
                    },
                },
            },
        }))
    }

    /**
     * Book a bed test
     */
    blocksArray.push(RenderHelper.renderStandardComponent('BookBedTest', {
        text: {
            bannerHeading: Resource.msg('bookbedtest.banner.header', 'hastens', null),
            bannerBody: Resource.msg('bookbedtest.banner.body', 'hastens', null),
            bannerButton: Resource.msg('bookbedtest.banner.button', 'hastens', null),
            heading: Resource.msg('bookbedtest.header', 'hastens', null),
            storeLocatorHeader: Resource.msg('bookbedtest.storelocator.header', 'hastens', null),
            storeLocatorNext: Resource.msg('buttons.next', 'hastens', null),
            factsTimeHeader: Resource.msg('bookbedtest.storelocator.facts.time.header', 'hastens', null),
            factsTimeBody: Resource.msg('bookbedtest.storelocator.facts.time.body', 'hastens', null),
            factsParticipantHeader: Resource.msg('bookbedtest.storelocator.facts.participant.header', 'hastens', null),
            factsParticipantBody: Resource.msg('bookbedtest.storelocator.facts.participant.body', 'hastens', null),
            factsParticipantBody2: Resource.msg('bookbedtest.storelocator.facts.participant.body2', 'hastens', null),
            factsLocationHeader: Resource.msg('bookbedtest.storelocator.facts.location.header', 'hastens', null),
            factsLocationBody: Resource.msg('bookbedtest.storelocator.facts.location.body', 'hastens', null),
            userFormHeader: Resource.msg('bookbedtest.userform.header', 'hastens', null),
            userFormBody: Resource.msg('bookbedtest.userform.body', 'hastens', null),
            confirmationHeader: Resource.msg('bookbedtest.confirmation.header', 'hastens', null),
            confirmationBody: Resource.msg('bookbedtest.confirmation.body', 'hastens', null),
            confirmationClose: Resource.msg('buttons.close', 'hastens', null),
            labelStore: Resource.msg('forms.store', 'hastens', null),
            labelCountry: Resource.msg('forms.country', 'hastens', null),
            labelFirstName: Resource.msg('forms.firstName', 'hastens', null),
            labelLastName: Resource.msg('forms.lastName', 'hastens', null),
            labelEmail: Resource.msg('forms.email', 'hastens', null),
            labelPhone: Resource.msg('forms.mobilephone', 'hastens', null),
            labelNewsLetter: Resource.msg('forms.newsletter', 'hastens', null),
            labelRequired: Resource.msg('forms.required', 'hastens', null),
            labelConsent: Resource.msg('forms.consent', 'hastens', null),
            buttonSubmit: Resource.msg('buttons.sendrequest', 'hastens', null),
            buttonCancel: Resource.msg('buttons.cancel', 'hastens', null),
        },
        showBanner: true,
        defaultStore: store.getID(),
        defaultCountry: store.custom['countryCodeValue'],
    }));

    /**
     * Video
     */
    if (store.custom['pp-video-show'] && store.custom['pp-video']) {
        var videoData = JSON.parse(store.custom['pp-video'] || '{}');
        blocksArray.push(RenderHelper.renderStandardComponent('VideoBlock', {
            video: videoData['video-url'],
            image: {
                sizes: {
                    mobile: { src: videoData['image-url'].replace('static.hastens.com/', 'static.hastens.com/768/') },
                    tablet: { src: videoData['image-url'].replace('static.hastens.com/', 'static.hastens.com/1200/') },
                    desktop: { src: videoData['image-url'].replace('static.hastens.com/', 'static.hastens.com/1440/') },
                },
            },
            textPosition: 'bottom',
            text: {
                heading: videoData['header'],
                body: videoData['preamble'],
            },
            theme: 'black-1'
        }));
    };

    /**
     * Store info
     */
    blocksArray.push(RenderHelper.renderStandardComponent('StoreInfo', {
        config: {
            apiKey: Site.getCurrent().getCustomPreferenceValue('mapAPI'),
            facebookUrl: Site.getCurrent().getCustomPreferenceValue('facebook_url'),
            instagramUrl: Site.getCurrent().getCustomPreferenceValue('instagram_url'),
            youtubeUrl: Site.getCurrent().getCustomPreferenceValue('youtube_url'),
        },
        store: {
            name: store.getName(),
            address: storeHelpers.getStoreAddress(store),
            email: store.getEmail(),
            phone: store.getPhone(),
            storeHours: JSON.parse(store.custom['store-hours-json']),
            latitude: store.getLatitude(),
            longitude: store.getLongitude(),
            facebookUrl: store.custom['facebook-url'],
            instagramUrl: store.custom['instagram-url'],
            description: store.custom['pp-store-description'],
        },
        text: {
            address: Resource.msg('partner.address', 'hastens', null),
            email: Resource.msg('forms.email', 'hastens', null),
            phone: Resource.msg('partner.phone', 'hastens', null),
            openingHours: Resource.msg('partner.openingHours', 'hastens', null),
            information: Resource.msg('partner.information', 'hastens', null),
            informationBody: Resource.msg('partner.information.body', 'hastens', null),
            direction: Resource.msg('partner.direction', 'hastens', null),
            closed: Resource.msg('closed', 'hastens', null),
        }
    }));

    /**
     * Floating bar
     */
    blocksArray.push(RenderHelper.renderStandardComponent('PartnerPageFloatingBar', {
        store: {
            phone: store.getPhone(),
            latitude: store.getLatitude(),
            longitude: store.getLongitude(),
            storeHours: JSON.parse(store.custom['store-hours-json']),
            canShow: store.custom['pp-contact-and-hours-bar-show'],
            address: storeHelpers.getStoreAddress(store),
        },
        text: {
            phone: Resource.msg('forms.mobilephone', 'hastens', null),
            contact: Resource.msg('partner.contact', 'hastens', null),
            address: Resource.msg('partner.address', 'hastens', null),
            direction: Resource.msg('partner.direction', 'hastens', null),
            buttonText: Resource.msg('partner.floatingBar.close', 'hastens', null),
            openingHour: Resource.msg('partner.floatingBar.openinghour', 'hastens', null),
            closed: Resource.msg('closed', 'hastens', null),
        }
    }));

    res.render('hastens/partnerPage', {
        CurrentPageMetaData: {
            title: store.custom['pp-name'] + ' | ' + store.getName(),
            description: store.custom['pp-meta-description'],
        },
        blocks: blocksArray,
    });

    next();
});

module.exports = server.exports();
