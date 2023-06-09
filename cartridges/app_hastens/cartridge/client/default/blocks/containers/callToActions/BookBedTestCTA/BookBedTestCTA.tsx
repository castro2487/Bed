import './BookBedTestCTA.scss';

import React, { ReactElement } from 'react';
import Grid from '@material-ui/core/Grid';

import { Background } from '../../../../shared/components/Background';
import { Button } from '../../../../shared/components/formFields/Button';
import { Image, Link, ScaleWidth, useServer } from '../../../server/ServerProvider';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import { Heading } from '../../../../shared/components/typography/Heading';

interface BookBedCTAContent {
    link: Link;
    text: {
        heading: string;
        intro: string;
        stepsHeading: string;
        steps: {
            heading1: string;
            heading2: string;
            image: Image;
            body: string;
        }[];
    };
}

export function BookBedTestCTA(): ReactElement {

    const { content: { text, link } } = useServer<BookBedCTAContent>();

    return (
        <Background theme="white-1">
            <div className="has-book-bed-test-cta">
                <div className="book-sample-bed">
                    <section className="body-section">
                        <div className="text-container centered">
                            <Heading level={2} size="md" className="heading text-header-text">{text.heading}</Heading>
                            <Paragraph className="text-header-text">{text.intro}</Paragraph>
                            <Button
                                href={link.url || '#book-a-bed-test'}
                                color="secondary">
                                {link.text}
                            </Button>
                            <Heading level={3} size="sm" className="steps-heading">{text.stepsHeading}</Heading>
                        </div>
                        <div className="information-container">
                            {
                                text.steps.map((info, index) => (
                                    <Grid container spacing={0} key={index} className={(index % 2 === 0 ? 'even' : '') + ' grid-container'}>
                                        <Grid item xs={12} sm={6} className="grid-container">
                                            <Background
                                                className="image"
                                                image={info.image}
                                                scaleWidth={{
                                                    desktop: ScaleWidth.W500,
                                                    tablet: ScaleWidth.W500,
                                                    mobile: ScaleWidth.W500,
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} className="grid-container">
                                            <div className="information">
                                                <h4>
                                                    <span className="step-heading-1">{info.heading1}</span>
                                                    <span className="step-heading-2">{info.heading2}</span>
                                                </h4>
                                                <Paragraph className="information-body">{info.body}</Paragraph>
                                            </div>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </div>
                    </section>
                </div>
            </div>
        </Background>
    );
}
