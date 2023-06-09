# Getting Started

- Clone this repository.
- Create a `dw.json` file in the project root with your sandbox credentials
  and other information. You can copy `dw.json.example` to get started.
  
## Configuring the sandbox

- In your sandbox under *Administration/Site Development/Site Import & Export*,
  import the agreed on zip file. This will contain all pages, settings, and
  site data needed for development.

or

- In your sandbox under *Administration/Operations/Import & Export*, upload
  the file `cartridges/app_hastens/HastensServices.xml` and import it into
  the system.
- In your sandbox under *Administration/Sites/Manage Sites/RefArchGlobal*,
  ensure that *Settings/Cartridge Path* starts with `app_hastens:int_hastens_storelocator`.
- In your sandbox under *Administration/Sites/Manage Sites/Business Manager*,
  ensure that *Settings/Cartridge Path* starts with `bm_app_hastens`.
- Also check that *Cache/Enable Page Caching* is turned off.

## Editor support

To make it easier to work with the Salesforce cloud platform you should use
an editor plugin that automatically synchronises file changes and provide
other useful support. Try one of these:

- PHPStorm: [Salesforce B2C Commerce (SFCC)](https://plugins.jetbrains.com/plugin/13668-salesforce-b2c-commerce-sfcc-).
  This is a commercial extension that costs €70 per year and user. A 30-day 
  trial is available.
- VS Code: [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode).
