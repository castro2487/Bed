import isPlainObject from 'lodash/isPlainObject';
import values from 'lodash/values';
import * as EmailValidator from 'email-validator';

import { Validator, AsyncValidator } from './FormProvider';
import { __, parsePhoneNumberFromString } from '../../helpers';

export const requiredValidator: Validator = (value) => {
    const error = {
        errorMessage: __('forms.validation.required'),
    };
    if (isPlainObject(value)) {
        const valid = values(value).every((objectValue) => objectValue !== undefined && objectValue !== '' && objectValue !== null);
        return valid ? null : error;
    } else {
        const valid = value !== undefined && value !== '' && value !== null;
        return valid ? null : error;
    }
};

export const phoneNumberValidator: AsyncValidator = (value: string) => {
    return parsePhoneNumberFromString(value).then((validatedNumber) => {
        if (validatedNumber && validatedNumber.isValid()) {
            return null;
        }
        return {
            errorMessage: __('forms.validation.invalid_telephone'),
        };
    });
};

export const emailValidator: Validator = (email: string) => {
    if (!email) {
        return null;
    }
    const error = {
        errorMessage: __('forms.validation.invalid_email'),
    };

    if (EmailValidator.validate(email)) {
        return null;
    }
    return error;
};

export const maxCharactersValidator = (maxLowercase: number, maxUppercase: number): Validator => (value: string) => {
    if (!value) {
        return null;
    }
    const lines = value.split('\n');
    const valid = lines.map((line) => {
        const numLowercase = (line.match(/[a-z]/g) || []).length;
        const numUppercase = line.length - numLowercase;
        const lowercasePercentage = Math.floor(numLowercase * (100 / maxLowercase));
        const uppercasePercentage = Math.floor(numUppercase * (100 / maxUppercase));
        return (lowercasePercentage + uppercasePercentage) <= 100;
    });
    if (valid.every((item) => !!item)) {
        return null;
    }
    return {
        errorMessage: __('forms.validation.max_characters_per_line'),
    };
};

export const maxLinesValidator = (max: number): Validator => (value: string) => {
    if (!value) {
        return null;
    }
    const error = {
        errorMessage: __('forms.validation.max_lines_line').replace('{0}', max.toString()),
    };
    return value.split('\n').length > max ? error : null;
};
