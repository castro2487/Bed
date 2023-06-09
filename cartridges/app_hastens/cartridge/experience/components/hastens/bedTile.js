'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var ImageHelper = require('~/cartridge/experience/utilities/ImageHelper.js');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BedTile', function(context) {
    var componentId = context.content.componentId || '';
    return {
        bed: context.content.bed.value,
        link: {
            text: Resource.msg('bedtile.grandvividus.readmore', 'hastens', null),
            url: URLUtils.url('GrandVividus-Show').toString(),
        },
        subheading: context.content.subheading,
        subheading2: context.content.subheading2,
        description1: context.content.description1,
        description2: context.content.description2,
        bedWeight: context.content.bedWeight,
        bedHeight: context.content.bedHeight,
        bedLayers: context.content.bedLayers,
        description3: context.content.description3,
        blockId: componentId.replace(/\s/g, "-"),
        bedImage: {
            sizes: ImageHelper.getSizes({
                mobile: null,
                tablet: null,
                desktop: context.content.bedImage,
            }),
        },
        text: {
            close: Resource.msg('buttons.close', 'hastens', null),
            showMore: Resource.msg('bedtile.showmore', 'hastens', null),
            cutThrough: Resource.msg('bedtile.cutthrough', 'hastens', null),
            enlargeImage: Resource.msg('bedtile.enlargeimage', 'hastens', null),
            showMoreHelper: Resource.msg('bedtile.showmore.helper', 'hastens', null),
            weightLabel: Resource.msg('bedtile.weightLabel', 'hastens', null),
            heightLabel: Resource.msg('bedtile.heightLabel', 'hastens', null),
            numLayersLabel: Resource.msg('bedtile.numLayersLabel', 'hastens', null),
        },
        requestCatalog: {
            text: {
                cta: Resource.msg('requestcatalog.cta', 'hastens', null),
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
        },
        bookBedTest: {
            text: {
                cta: Resource.msg('bookbedtest.cta', 'hastens', null),
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
        },
        storeLocator: {
            text: {
                cta: Resource.msg('storelocator.cta', 'hastens', null),
            },
            link: URLUtils.url('Stores-Find').toString(),
        },
        bedConfigurator: {
            text: {
                cta: Resource.msg('bedConfigurator.cta', 'hastens', null),
            },
        },
    };

});
