import React, { Fragment, ReactElement } from 'react';

interface Props {
    children: string;
    parameters: (string | ReactElement)[];
}

export function StringHelper(props: Props): ReactElement {

    const regexp = new RegExp(/(\{[0-9]+\})/g);
    const parts = props.children.split(regexp);

    return (
        <Fragment>
            {parts.map((part, partIndex) => {
                if (part.match(regexp)) {
                    const matches = part.match(new RegExp(/[0-9]+/));
                    const parameterIndex = parseInt(matches[0], 10);
                    const parameter = props.parameters[parameterIndex];
                    if (parameter) {
                        return <Fragment key={partIndex}>{parameter}</Fragment>;
                    }
                }
                return <Fragment key={partIndex}>{part}</Fragment>;
            })}
        </Fragment>
    );

}

export function addParamsToString(str: string, ...params: string[]): string {
    return params.reduce((previousValue, currentValue, currentIndex) => {
        const regexp = new RegExp(`\\{${currentIndex}\\}`, 'g');
        return previousValue.replace(regexp, currentValue);
    }, str);
}
