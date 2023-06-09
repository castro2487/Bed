import './IntroductionText.scss';

import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useServer } from '../../../server/ServerProvider';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';

export function IntroductionText() {
    const { content: { text } } = useServer<any>();

    return (
        <section className="has-nbd-introduction-text-block">
            <div className="text">
                <Heading level={2} size="lg">
                    {text.heading}
                </Heading>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6} className="column-1">
                        <p className="large">{text.quote}</p>
                        <p className="small">
                            <strong>{text.quoteFooter}</strong>
                            <span>{text.quoteFooterSupport}</span>
                        </p>
                    </Grid>
                    <Grid item xs={12} md={6} className="column-2">
                        <Paragraph>{text.body}</Paragraph>
                    </Grid>
                </Grid>
            </div>
        </section>
    );

}
