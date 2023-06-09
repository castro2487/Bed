module.exports = [
    {
        id: 'layout',
        name: 'Layout',
        description: 'Component types that control the layout of the page. Check compatibility to see which component types are recommended to be used inside these components.',
        children: [
            {
                id: 'grid',
                description: 'A component type that uses the containing components to create a grid. The containing components are usually of the same type.',
            },
            {
                id: 'splitBlock',
                description: 'A component type that is similar to Grid but works a little bit differently. It’s built for situations when you want two components of different sizes next to each other. Split Block will force the two components to be the same height.',
                children: [
                    {
                        id: 'spaceHolder',
                        description: 'A component type that is used to fill out empty space in Split Block.',
                    },
                ],
            },
            {
                id: 'tabs',
                description: 'A component type that is used to create tabbable content. It was built for the Request a Catalog/Book a Bed Test page.',
            },
            {
                id: 'slideshow',
                description: 'A component type that uses the containing components to create a slideshow.',
            },
            {
                id: 'slider',
                description: 'A component type that uses the containing components to create a slider.',
            },
            {
                id: 'slider2',
                description: 'A component type that uses the containing components to create a slider2.',
            },
        ],
    },
    {
        id: 'headers',
        name: 'Headers',
        description: 'Component types whose main purpose is to display the name of the page.',
        children: [
            {
                id: 'header',
                description: 'A header component type that has an animated background. It was built for the Sleep Better Live Better page.',
            },
            {
                id: 'header2',
                description: 'A header component type that was initially designed for the shop pages.',
            },
        ],
    },
    {
        id: 'callToActions',
        name: 'Call-to-actions',
        description: 'Component types whose main purpose is to link to another page or to another component within the same page.',
        children: [
            {
                id: 'cta',
                description: 'A CTA component type that was built for the start page.',
                compatibility: ['Slideshow'],
            },
            {
                id: 'cta2',
                description: 'A component type that was built for the Store Locator CTA that is used on almost every page. Technically it could be used as a text story but originally it was meant to be used as a CTA.',
            },
            {
                id: 'cta3',
                description: 'A component type that was built for the Grand Vividus CTA on the start page.',
                compatibility: ['Slideshow'],
            },
            {
                id: 'cta4',
                description: 'A CTA component type that has a background that zooms in when hovering. It was built to be used in a Grid on the start page.',
                compatibility: ['Grid'],
            },
            {
                id: 'cta6',
                description: 'A component type built to link to a Book a Bed Test form.',
            },
            {
                id: 'cta7',
                description: 'A component type built to link to a Request a Catalog form.',
            },
            {
                id: 'cta8',
                description: 'A CTA component type that takes up the full width of the page. It was built for the start page.',
            },
            {
                id: 'image2',
                description: 'A CTA component type that was built to be used in a Grid on the Accessories page. Unlike other component types it has the ability to span over multiple columns.',
                compatibility: ['Grid'],
            },
        ],
    },
    {
        id: 'textStories',
        name: 'Text stories',
        description: 'Component types that are built to contain long texts.',
        children: [
            {
                id: 'textStory',
                description: 'A basic text story component type.',
            },
            {
                id: 'textStory3',
                description: 'A text story component type that was built to be used in a Split Block on the Restore page.',
                compatibility: ['Split Block'],
            },
            {
                id: 'imageTextStory',
                description: 'A text story component type built to be used in a Grid on the New Business Development page.',
                compatibility: ['Grid'],
            },
            {
                id: 'imageTextStory2',
                description: 'A text story component type built to be used in a Grid on the Restore page.',
                compatibility: ['Grid'],
            },
            {
                id: 'textStory4',
                description: 'A text story component type built for the Heritage page.',
            },
            {
                id: 'pTextHistory',
                description: 'A text story component for general use'
            },
            {
                id: 'textStory5',
                description: 'A text story component type built for the Heritage page.',
            },
            {
                id: 'materialsTextStory',
                description: 'A text story component type built for the Natural Materials page.',
            },
            {
                id: 'nbdText1',
                description: 'A text story component type built for the New Business Development page.',
            },
            {
                id: 'nbdText2',
                description: 'A text story component type built for the New Business Development page.',
            },
        ],
    },
    {
        id: 'media',
        name: 'Media',
        description: 'Component types whose main purpose is to display media content.',
        children: [
            {
                id: 'image',
                description: 'A basic component type for displaying an image.',
                compatibility: ['Grid', 'Split Block'],
            },
            {
                id: 'video',
                description: 'A basic component type for displaying a video. The video is opened in a dialog when the play button is pressed.',
                compatibility: ['Grid', 'Split Block'],
            },
            {
                id: 'videoList',
                description: 'A component type for displaying a list of videos. It was built for the Sleep page.',
            },
        ],
    },
    {
        id: 'forms',
        name: 'Forms',
        description: 'Component types that contains a form.',
        children: [
            {
                id: 'bedConfigurator',
                description: 'A component type that allows the user to configure a bed and request a quote.',
            },
            {
                id: 'bookBedTest',
                description: 'A component type that allows the user to book a bed test in a Hästens store.',
            },
            {
                id: 'bookBedTest2',
                description: 'This component type is the same as Book A Bed Test but with a different behaviour. It was built for the We Sleep Do You page.',
            },
            {
                id: 'bookBedTest3',
                description: 'This component type is the same as Book A Bed Test but with a different behaviour. It was built for the Discover What\'s Missing page.',
            },
            {
                id: 'interiorDesignCollaborations',
                description: 'A component type that allows the user to join the Interior Design Program. It was built for the Interior Design Collaborations page.',
            },
            {
                id: 'newsletter',
                description: 'A component type that allows the user to sign up for the newsletter. This component type was built for the footer.',
            },
            {
                id: 'partnerSignUp',
                description: 'A component type that allows potential partners to request to get contacted. This component type was built for the New Business Development page.',
            },
            {
                id: 'requestCatalog',
                description: 'A component type that allows users to request the Hästens Catalog.',
            },
            {
                id: 'requestCatalog2',
                description: 'This component type is the same as Request a Catalog but with a different behaviour. It was built for the Sleep Better Live Better page.',
            },
            {
                id: 'requestCatalog3',
                description: 'This component type is the same as Request a Catalog but with a different behaviour. It was built for the We Sleep Do You page.',
            },
            {
                id: 'requestCatalog4',
                description: 'This component type is the same as Request a Catalog but with a different behaviour. It was built for the Discover What\'s Missing page.',
            },
            {
                id: 'restoreSignup',
                description: 'A component type that allows users to request more information about Dr. Jussi Eerikäinen or Peter von Ah. This component type was built for the Restore page.',
            },
            {
                id: 'videoSubscription',
                description: 'A component type that allows users to sign up to recieve 10 short videos. This component type was built for the Sleep Better Live Better page.',
            },
        ],
    },
    {
        id: 'designer',
        name: 'Designer',
        description: 'Component types that take in the options collection and designer.',
        children: [
            {
                id: 'hero',
                description: 'A component type built for the Designers subpages to display which collection the user is currently viewing.',
            },
            {
                id: 'cta5',
                description: 'A component type that was built to be used in a Split Block on the Designers page to link to subpages. Later we added so called "variations" to this component type so that we can reuse it in situations when the functionality is the same but the layout is different.',
                compatibility: ['Split Block'],
            },
            {
                id: 'banner',
                description: 'A component type built for the Bernadotte & Kylberg page to link to more information about a certain bed.',
            },
            {
                id: 'textStory2',
                description: 'A component type built to be used in a Split Block on the Designers subpages.',
                compatibility: ['Split Block'],
            },
        ],
    },
    {
        id: 'other',
        name: 'Other',
        description: '',
        children: [
            {
                id: 'bedTile',
                description: 'A component type that was built to be used in a Grid on the Beds page to display detailed information about a bed. When expanded the content below is pushed down.',
                compatibility: ['Grid'],
                children: [
                    {
                        id: 'bedColors',
                        description: 'A component type that was built specifically to display a slideshow with bed colors in a Bed Tile.',
                    },
                    {
                        id: 'informationTable',
                        description: 'A component type that was built specifically to display an information table in a Bed Tile.',
                    },
                ],
            },
            {
                id: 'bedTile2',
                description: 'A simpler version of Bed Tile built specifically for the Grand Vividus bed.',
            },
            {
                id: 'colorsGrid',
                description: 'A component type built for the Bed Fabrics page. This component type can be populated with colors using the Colors Image component.',
                children: [
                    {
                        id: 'image3',
                        description: 'A component type that was built specifically to display images in a Colors Grid.',
                    },
                ],
            },
            {
                id: 'grandVividusPresentation',
                description: 'A component type built for the Grand Vividus page.',
            },
            {
                id: 'newsTile2',
                description: 'A component type built to be used in a Grid on the start page. It\'s a rebuild of the previous News Tile that opened a news item in a dialog. This version opens up a new page instead.',
                compatibility: ['Grid'],
            },
            {
                id: 'slideContent1',
                description: 'A component type built to be used in a Slideshow on the New Business Development page.',
                compatibility: ['Slideshow'],
            },
            {
                id: 'slideshow2',
                description: 'A component type that showcases all the available colors for a certain bed.',
            },
            {
                id: 'textBox',
                description: 'A component type that was built for the purpose of creating text only pages like Privacy Policy.',
            },
        ],
    },
];
