import React, { Component, ReactNode } from 'react';
import Check from '@material-ui/icons/Check';
import makeClassName from 'classnames';

import { BedTab } from '../../../../../../server/BedOrderService';
import { FormContext } from '../../../../../../../shared/components/formFields/FormProvider';
import { getPropertyTranslation } from '../../../helpers';

interface Props {
    tabs: BedTab[];
    activeTab: number;
    onChangeActiveTab: (activeTab: number) => void;
}

const defaultProps = {
    tabs: [],
    activeTab: 0,
};

export class BedTabs extends Component<Props> {

    static defaultProps = defaultProps;
    static contextType = FormContext;

    render(): ReactNode {
        return (
            <ul className="bed-tabs">
                {this.props.tabs.map((tab, index) => (
                    <li
                        key={index}
                        className={makeClassName({
                            'active': this.props.activeTab === index,
                            'complete': this.context.isValid(`panel-${index}`),
                        })}>
                        <button
                            disabled={tab.isDisabled}
                            onClick={() => {
                                this.props.onChangeActiveTab(index);
                            }}>
                            {this.context.isValid(`panel-${index}`) && (
                                <Check fontSize="inherit" />
                            )}
                            {getPropertyTranslation(tab.displayName)}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }

}
