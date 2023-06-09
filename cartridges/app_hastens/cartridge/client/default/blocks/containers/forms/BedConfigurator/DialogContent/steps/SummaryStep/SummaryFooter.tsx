import React, { Fragment } from 'react';
import { SummaryState } from './SummaryStep';
import { __ } from '../../../../../../../shared/helpers';
import { useServer } from '../../../../../../server/ServerProvider';

export function SummaryFooter(
    props: Pick<SummaryState, 'price' | 'currency' | 'totalLegsWorth'>,
) {

    const server = useServer();

    const { price, currency, totalLegsWorth } = props;

    function displayLegsWorth() {
        return (
            totalLegsWorth ? (
                <tr>
                    <td><span className="price-section-smaller-text">Legs included worth</span></td>
                    <td><span className="price-and-currency">{totalLegsWorth} {currency}</span></td>
                    <td><span className="price-section-smaller-text"></span></td>
                </tr>
            ) : null
        );
    }

    function getTaxMessage() {
        return 'US' === server.getAllowedCountry() ? 'Excluding sales taxes' : 'VAT incl';
    }

    function displayLoader() {
        return <span className="price-section-smaller-text">Loading price <span className="dot one">.</span><span className="dot two">.</span><span className="dot three">.</span></span>;
    }

    return (
        <footer className="price-section">
            {
                price === '' ? displayLoader() : (
                    <div>
                        <table>
                            <tbody>
                                {price !== '0' && displayLegsWorth()}
                                <tr key="legs">
                                    <td><span className="total-price">{__('bedconf.general_total_price')}</span></td>
                                    {price === '0' ? (
                                        <td><span className="price-not-found">&mdash;</span></td>
                                    ) : (
                                        <Fragment>
                                            <td><span className="price-and-currency">{price} {currency}</span></td>
                                            <td><span className="price-section-smaller-text">({getTaxMessage()})</span></td>
                                        </Fragment>
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            }

        </footer>
    );
}
