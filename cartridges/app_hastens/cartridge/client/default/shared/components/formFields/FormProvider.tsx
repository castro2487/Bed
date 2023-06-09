import React, { createContext, useContext, ReactElement, Component } from 'react';
import set from 'lodash/set';
import unset from 'lodash/unset';
import cloneDeep from 'lodash/cloneDeep';

type ValidatorResult = null | {errorMessage: string};
export type Validator = (value) => ValidatorResult;
export type AsyncValidator = (value) => Promise<ValidatorResult>;

export interface FormContextProps {
    getError: (id: string) => string;
    validate: (id: string, value, validators: Validator[], groupId?: string) => void;
    asyncValidate: (id: string, value, asyncValidators: AsyncValidator[], groupId?: string) => void;
    remove: (id: string) => void;
    isValid: (groupId?: string) => boolean;
}

interface State {
    error: {
        [id: string]: {
            groupId: string | null;
            messages: string[] | null;
            pending: boolean;
        };
    };
}

const initialState = {
    error: {},
};

export const FormContext = createContext<Partial<FormContextProps>>(null);

export class FormProvider extends Component<any, State> {

    state = initialState;

    runValidators(value, validators: Validator[]): string[] | null {
        const errors = validators
            .map((validator: Validator) => {
                const result = validator(value);
                return result === null ? result : result.errorMessage;
            })
            .filter((error) => {
                return error !== null;
            });
        return errors.length ? errors as string[] : null;
    }

    validate(id: string, value, validators: Validator[], groupId: string = null) {
        if (!validators) {
            return;
        }
        const messages = this.runValidators(value, validators);
        this.setState((previousState) => {
            const nextState = cloneDeep(previousState);
            set(nextState.error, id, { groupId, messages });
            return nextState;
        });
    }

    asyncValidate(id: string, value, asyncValidators: AsyncValidator[], groupId: string = null) {
        if (!asyncValidators) {
            return;
        }
        const promises = asyncValidators.map((asyncValidator) => asyncValidator(value));

        this.setState((previousState) => {
            const nextState = cloneDeep(previousState);
            set(nextState.error, [id, 'pending'], true);
            return nextState;
        });

        Promise.all(promises).then((results) => {
            const errors = results
                .map((result: ValidatorResult) => {
                    return result === null ? result : result.errorMessage;
                })
                .filter((error) => {
                    return error !== null;
                });
            this.setState((previousState) => {
                const nextState = cloneDeep(previousState);
                set(nextState.error, id, {
                    groupId,
                    messages: errors.length ? errors as string[] : null,
                    pending: false,
                });
                return nextState;
            });
        });
    }

    getError(id: string): string {
        const errorsForField = this.state.error[id];
        return errorsForField && errorsForField.messages ? errorsForField.messages[0] : null;
    }

    isValid(groupId: string = null): boolean {
        return Object.keys(this.state.error).every((id: string) => {
            const field = this.state.error[id];
            if ((groupId !== null) && (field.groupId !== groupId)) {
                return true;
            } else {
                return field.messages === null;
            }
        });
    }

    isPending(groupId: string = null): boolean {
        return Object.keys(this.state.error).every((id: string) => {
            const field = this.state.error[id];
            if ((groupId !== null) && (field.groupId !== groupId)) {
                return true;
            } else {
                return field.pending === true;
            }
        });
    }

    remove(id: string) {
        if (!this.state.error[id]) {
            return;
        }
        this.setState((previousState) => {
            const nextState = cloneDeep(previousState);
            unset(nextState.error, id);
            return nextState;
        });
    }

    render(): ReactElement {
        return (
            <FormContext.Provider
                value={{
                    getError: (id) => this.getError(id),
                    validate: (id, value, validators, groupId) => this.validate(id, value, validators, groupId),
                    asyncValidate: (id, value, asyncValidators, groupId) => this.asyncValidate(id, value, asyncValidators, groupId),
                    isValid: (groupId) => this.isValid(groupId),
                    remove: (id) => this.remove(id),
                }}>
                {this.props.children}
            </FormContext.Provider>
        );
    }

}

export function useForm() {
    return useContext(FormContext);
}
