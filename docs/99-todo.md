# Todo and questions

## Tracking Consent

We should probably use the built-in Salesforce support for this through
`trackingAllowed`, `privacy`, and `clickStream` in `dw.system.Session`.

*TBD:* Since this is global functionality relevant for both NetConsult and 
Deloitte, decide who owns the issue and how to use it.

## Google Tag Manager

Currently, Google Tag Manager is used to track customer behavior. We want to
keep doing this in Salesforce.

[This blog post](https://developer.salesforce.com/blogs/2019/04/google-tag-manager-for-community-cloud.html)
contains useful information on how to integrate GTM with Salesforce.
