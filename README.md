# Hästens SF Commerce Cloud

See the `docs` folder for more information.

The documentation can be viewed online 
[here](https://netconsult-sweden-ab.gitlab.io/hastens/sf-commerce-cloud). 

# Storefront Reference Architecture (SFRA)

SFRA version 5.0.1

# Getting Started

1. Clone this repository.

2. Run `npm install` to install all of the local dependencies (node version 8.x or current LTS release recommended)

3. Run `npm run scripts:app_hastens` from the command line that would compile all client-side JS files. Run `npm run css:app_hastens` that would do the same for css.
Note that SFRA base js and css have already been built and you don't have to build them again

4. Create `dw.json` file in the root of the project (take a look at the dw.json.example to view an example of how this file should be composed):
```json
{
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "yourlogin",
    "password": "yourpwd",
    "code-version": "version_to_upload_to"
}
```

5. Launch Prophet to upload all the cartridges on the sandbox defined in dw.json.

6. You should now be ready to navigate to and use your site.

## Compiling your application

* `npm run css:XXX` - Compiles all .scss files in cartridge XXX into CSS (eg. "npm run css:app_hastens").
* `npm run scripts:XXX` - Compiles all .js files in cartridge XXX and aggregates them (eg. "npm run scripts:app_hastens").
* `npm run start:XXX` - Set the builder in listen mode on cartridge XXX (eg. npm run start:app_hastens).