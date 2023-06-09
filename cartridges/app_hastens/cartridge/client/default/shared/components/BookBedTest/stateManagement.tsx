import React, { useReducer, createContext, useContext } from 'react';

interface Action {
    type: string;
    data: any;
}

interface FormData {
    country: string;
    location: string;
    firstname: string;
    lastname: string;
    email: string;
    mobileNumber: string;
    recaptcha: string;
    newsLetter: boolean;
    telephone: string;
    phonePrefix: string;
    formId: string;
    pageOrigin: string;
    position: {
        method: string;
        longitude: string;
        latitude: string;
    };
}

export interface SelectOption {
    label: string;
    value: string | null;
    country?: string | null;
}

export interface State {
    processing: boolean;
    currentLocation: string;
    isConsentBoxVisible: boolean;
    storesList: SelectOption[];
    countries: SelectOption[];
    localStoreList: SelectOption[];
    formData: FormData;
}

const InitialState: State = {
    processing: false,
    currentLocation: null,
    isConsentBoxVisible: false,
    storesList: [],
    localStoreList: [],
    countries: [],
    formData: {
        country: null,
        location: null,
        firstname: '',
        lastname: '',
        email: '',
        mobileNumber: '',
        recaptcha: '',
        newsLetter: false,
        telephone: '',
        phonePrefix: '',
        formId: 'bedtest1',
        pageOrigin: '',
        position: {
            method: 'geolocation',
            longitude: null,
            latitude: null,
        },
    },
};

const StateContext = createContext(null);
const DispatchContext = createContext(null);

function UiReducer(state: State, action: Action) {
    switch (action.type) {
        case 'updateState': {
            return { ...state, ...action.data };
        }
        case 'updateForm': {
            return {
                ...state,
                formData: {
                    ...state.formData,
                    ...action.data,
                },
            };
        }
        case 'resetForm': {
            return {
                ...state,
                formData: InitialState.formData,
            };
        }
        default: {
            return state;
        }
    }
}

function BookBedProvider({ children }) {
    const [state, dispatch] = useReducer(UiReducer, InitialState);

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

function useBookBedState() {
    const context = useContext(StateContext);
    if (context === undefined) {
        throw new Error('useBookBedState must be used within a BookBedProvider');
    }
    return context;
}

function useBookBedDispatch() {
    const context = useContext(DispatchContext);
    if (context === undefined) {
        throw new Error('useBookBedDispatch must be used within a BookBedProvider');
    }
    return context;
}

export { BookBedProvider, useBookBedState, useBookBedDispatch };
