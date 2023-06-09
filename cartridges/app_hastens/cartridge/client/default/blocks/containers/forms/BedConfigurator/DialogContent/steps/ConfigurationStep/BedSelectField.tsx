import React, { Component, ReactNode, Fragment } from 'react';

import { Bed } from '../../../../../../server/BedOrderService';
import { ListBox } from '../../../../../../../shared/components/formFields/ListBox';

export interface BedSelectFieldProps {
    options: Bed[];
    value: string;
    onChange: (value) => void;
}

const defaultProps = {
    options: [],
    value: '',
};

const Option = (props) => (
    <Fragment>
        <img src={props.option.images.icon} />
        <span className="bed-name">{props.option.displayName}</span>
    </Fragment>
);

export class BedSelectField extends Component<BedSelectFieldProps> {

    static defaultProps = defaultProps;

    componentDidMount() {
        if (!this.props.value && this.props.options.length) {
            this.props.onChange(this.props.options[0].code);
        }
    }

    render(): ReactNode {
        return (
            <ListBox
                id="bed-select-field"
                className="bed-select-field"
                aria-label="Select a bed"
                value={this.props.value}
                options={this.props.options}
                valueKey="code"
                optionComponent={Option}
                onChange={(value) => {
                    this.props.onChange(value);
                }}
            />
        );
    }

}
