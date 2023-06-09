import React, { ReactElement, useEffect, useState, useRef } from 'react';
import uniqueId from 'lodash/uniqueId';
import omit from 'lodash/omit';

import { Validator, useForm, AsyncValidator } from './FormProvider';
import { requiredValidator } from './validators';

interface Props {
    component: any;
    validators?: Validator[];
    asyncValidators?: AsyncValidator[];
    id?: string;
    groupId?: string;
    value: any;
    onChange?: (value) => void;
}

interface Labels {
    label?: string;
    selectLabel?: string;
}

export function FormField<T = void>(props: Props & Labels & T): ReactElement {

    const form = useForm();
    const [touched, setTouched] = useState(false);
    const id = useRef(null);

    if (id.current === null) {
        id.current = props.id || `form-field-${uniqueId()}`;
    }

    useEffect(() => {
        return onUnmount;
    }, []);

    useEffect(() => {
        validate(props.value);
    }, [props.value]);

    function onUnmount() {
        form.remove(id.current);
    }

    function validate(value) {
        form.validate(id.current, value, props.validators, props.groupId);
        form.asyncValidate(id.current, value, props.asyncValidators, props.groupId);
    }

    const Component = props.component;
    const componentProps = omit(props, ['component', 'validators', 'id']);
    const error = form.getError(id.current);

    const isRequired = Boolean(props.validators) ? props.validators.reduce(
        (acc, validator) => acc || (validator === requiredValidator),
        false,
    ) : false;

    const labels: Labels = {};
    const requiredSymbol = isRequired ? ' *' : '';

    if (props.label) {
        labels.label = props.label ? props.label + requiredSymbol : null;
    }

    if (props.selectLabel) {
        labels.selectLabel = props.selectLabel ? props.selectLabel + requiredSymbol : null;
    }

    return (
        <Component
            {...componentProps}
            {...labels}
            id={id.current}
            onBlur={() => {
                setTouched(true);
            }}
            error={(error !== null) && touched}
            errorText={error}
        />
    );

}
