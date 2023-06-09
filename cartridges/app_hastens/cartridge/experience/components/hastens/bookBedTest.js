'use strict';

var RenderHelper = require('~/cartridge/experience/utilities/RenderHelper.js');
var Resource = require('dw/web/Resource');

module.exports.render = RenderHelper.renderStandardComponentWithContext('BookBedTest', function(context) {
    return {
        text: {
            heading: context.content.formHeading,
            storeLocatorHeader: context.content.chooseStoreHeading,
            storeLocatorBody: context.content.chooseStoreBody,
            storeLocatorNext: Resource.msg('buttons.next', 'hastens', null),
            factsTimeHeader: Resource.msg('bookbedtest.storelocator.facts.time.header', 'hastens', null),
            factsTimeBody: Resource.msg('bookbedtest.storelocator.facts.time.body', 'hastens', null),
            factsParticipantHeader: Resource.msg('bookbedtest.storelocator.facts.participant.header', 'hastens', null),
            factsParticipantBody: Resource.msg('bookbedtest.storelocator.facts.participant.body', 'hastens', null),
            factsParticipantBody2: Resource.msg('bookbedtest.storelocator.facts.participant.body2', 'hastens', null),
            factsLocationHeader: Resource.msg('bookbedtest.storelocator.facts.location.header', 'hastens', null),
            factsLocationBody: Resource.msg('bookbedtest.storelocator.facts.location.body', 'hastens', null),
            userFormHeader: context.content.personalDataHeading,
            userFormBody: context.content.personalDataBody,
            confirmationHeader: context.content.confirmationHeading,
            confirmationBody: context.content.confirmationBody,
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
        containerClass: context.content.topSpacing ? context.content.topSpacing.value : '',
        blockId: context.content.componentId,
    };
});
