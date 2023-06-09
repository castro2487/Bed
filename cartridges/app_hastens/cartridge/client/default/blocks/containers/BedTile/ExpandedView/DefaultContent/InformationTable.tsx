import './InformationTable.scss';

import React, { FC } from 'react';
import { BedDataTable } from '../../helpers';

interface Props {
    content: Omit<BedDataTable, 'typeHelper' | 'heightHelper' | 'layersHelper' | 'fillingHelper' | 'springsNumberHelper'>;
    text: BedDataTable;
}

export const InformationTable: FC<any> = ({ text, content }: Props) => {

    function header(key) {
        const helperText = text[key + 'Helper'] ? `<span class="no-uppercase">${text[key + 'Helper']}</span>` : '';
        return text[key] + helperText;
    }

    return (
        <div className="has-bed-tile__information-table">
            <table className="table">
                <tbody>
                    {Object.keys(content).map((key, index) => {
                        return content[key] ? (
                            <tr key={index}>
                                <th className="left-data text-light" dangerouslySetInnerHTML={{ __html: header(key) }} />
                                <td className="right-data text-light">{content[key]}</td>
                            </tr>
                        ) : null;
                    })}
                </tbody>
            </table>
        </div>
    );
};
