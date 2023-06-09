import './InvestText.scss';

import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useServer } from '../../../server/ServerProvider';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';

interface InvestTextContent {
    text: {
        heading: string;
        body: string;
        storeSize: string;
        investment: string;
        roi: string;
        storeSizeHeader: string;
        investmentHeader: string;
        roiHeader: string;
    };
}

export function InvestText() {

    const { content: { text } } = useServer<InvestTextContent>();

    const shortFacts = [
        {
            heading: text.storeSizeHeader,
            paragraph: text.storeSize,
        },
        {
            heading: text.investmentHeader,
            paragraph: text.investment,
        },
        {
            heading: text.roiHeader,
            paragraph: text.roi,
        },
    ];
    return (
        <section className="has-nbd-invest-text-block">
            <div className="section">
                <Heading level={2} size="md">{text.heading}</Heading>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} className="column-1">
                        <Paragraph>{text.body}</Paragraph>
                    </Grid>
                    <Grid item xs={12} md={6} className="column-2">
                        <Grid container spacing={2}>
                            {shortFacts.map((shortFact, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <div className="short-fact">
                                        <strong>{shortFact.heading}</strong>
                                        <span>{shortFact.paragraph}</span>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </section>
    );

}
