import { createMuiTheme, Theme as MuiTheme, ThemeOptions } from '@material-ui/core/styles';
import { ButtonColor } from './components/formFields/Button';
import { Theme } from '../blocks/server/ServerProvider';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export const montserratFontFamily = '"Montserrat", "Helvetica Neue", Helvetica, Arial, sans-serif';

const primary = {
    50: '#e0e1e6',
    100: '#b3b3c1',
    200: '#808198',
    300: '#4d4f6e',
    400: '#26294f',
    500: '#000330',
    600: '#00032b',
    700: '#000224',
    800: '#00021e',
    900: '#000113',
    A100: '#5454ff',
    A200: '#2121ff',
    A400: '#0000ed',
    A700: '#0000d4',
    contrastDefaultColor: 'light',
};

const secondary = {
    50: '#e6eef7',
    100: '#c0d4eb',
    200: '#96b7dd',
    300: '#6b9acf',
    400: '#4c85c5',
    500: '#2c6fbb',
    600: '#2767b5',
    700: '#215cac',
    800: '#1b52a4',
    900: '#104096',
    A100: '#c7d9ff',
    A200: '#94b6ff',
    A400: '#6193ff',
    A700: '#4781ff',
    contrastDefaultColor: 'light',
};

const lightThemeError = {
    50: '#fce8e3',
    100: '#f8c5b9',
    200: '#f39e8a',
    300: '#ee775b',
    400: '#ea5937',
    500: '#e63c14',
    600: '#e33612',
    700: '#df2e0e',
    800: '#db270b',
    900: '#d51a06',
    A100: '#fffefd',
    A200: '#ffceca',
    A400: '#ff9e97',
    A700: '#ff867e',
    contrastDefaultColor: 'light',
};

const darkThemeError = {
    50: '#ffede9',
    100: '#ffd3c8',
    200: '#ffb5a4',
    300: '#ff977f',
    400: '#ff8163',
    500: '#ff6b48',
    600: '#ff6341',
    700: '#ff5838',
    800: '#ff4e30',
    900: '#ff3c21',
    A100: '#ffffff',
    A200: '#ffffff',
    A400: '#ffd5d0',
    A700: '#ffbeb7',
    contrastDefaultColor: 'dark',
};

const baseThemeOptions: ThemeOptions = {
    typography: {
        fontFamily: montserratFontFamily,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
        },
    },
    spacing: 10,
    props: {
        MuiButtonBase: {
            disableRipple: true,
        },
    },
    overrides: {
        MuiDialog: {
            paper: {
                margin: 15,
            },
            paperWidthFalse: {
                maxWidth: 'calc(100% - 30px)',
            },
            paperScrollPaper: {
                maxHeight: 'calc(100% - 30px)',
            },
        },
        MuiBackdrop: {
            root: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
            },
        },
        MuiFormHelperText: {
            root: {
                position: 'absolute',
                top: '100%',
                fontSize: 10,
                width: '100%',
            },
            contained: {
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 14,
                paddingRight: 14,
            },
        },
        MuiInputLabel: {
            marginDense: {
                transform: 'translate(14px, 12px) scale(1)',
                '&$shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                },
            },
        },
        MuiInputBase: {
            input: {
                '&:-webkit-autofill': {
                    transitionProperty: 'background-color',
                    transitionDelay: '9999999999s',
                },
            },
        },
        MuiOutlinedInput: {
            root: {
                borderRadius: 2,
            },
        },
        MuiMenu: {
            paper: {
                maxHeight: 425,
                borderRadius: 0,
            },
        },
    },
};

const lightThemeOptions: ThemeOptions = {
    palette: {
        primary,
        secondary,
        error: lightThemeError,
    },
    overrides: {
        MuiFormLabel: {
            root: {
                color: 'rgba(0, 0, 0, 0.55)', // Accessibility
            },
        },
    },
};

const darkThemeOptions: ThemeOptions = {
    palette: {
        primary,
        secondary,
        error: darkThemeError,
    },
    overrides: {
        MuiTypography: {
            root: {
                color: '#fff',
            },
        },
        MuiFormLabel: {
            root: {
                color: '#fff',
                '&$focused': {
                    color: '#fff',
                },
                '&$disabled': {
                    color: '#fff',
                },
            },
        },
        MuiInputBase: {
            root: {
                color: '#fff',
                '&$disabled': {
                    color: '#fff',
                },
            },
            input: {
                '&:-webkit-autofill': {
                    textFillColor: '#fff',
                },
            },
        },
        MuiOutlinedInput: {
            notchedOutline: {
                borderColor: '#fff',
            },
            root: {
                '&$focused $notchedOutline': {
                    borderColor: '#fff',
                },
                '&$disabled $notchedOutline': {
                    borderColor: '#fff',
                },
                '&:hover $notchedOutline': {
                    borderColor: '#fff',
                },
            },
        },
        MuiCheckbox: {
            root: {
                color: 'rgba(255, 255, 255, 0.54)',
            },
        },
        MuiIconButton: {
            root: {
                color: '#fff',
            },
        },
    },
};

export const lightTheme = createMuiTheme(merge(cloneDeep(baseThemeOptions), lightThemeOptions));
export const darkTheme = createMuiTheme(merge(cloneDeep(baseThemeOptions), darkThemeOptions));

export function getButtonColor(serverTheme: Theme): ButtonColor {
    switch (serverTheme) {
        case 'primary-1':
        case 'purple-1':
        case 'black-1':
        case 'grey-1':
            return 'light';
        case 'white-1':
        case 'grey-3':
        case 'grey-4':
            return 'dark';
        default:
            return 'primary';
    }
}

export function getPaletteType(serverTheme: Theme): 'dark' | 'light' {
    switch (serverTheme) {
        case 'primary-1':
        case 'purple-1':
        case 'black-1':
        case 'grey-1':
            return 'dark';
        case 'white-1':
        case 'grey-3':
        case 'grey-4':
        default:
            return 'light';
    }
}

export function getTheme(serverTheme: Theme): MuiTheme {
    switch (getPaletteType(serverTheme)) {
        case 'dark':
            return darkTheme;
        default:
            return lightTheme;
    }
}
