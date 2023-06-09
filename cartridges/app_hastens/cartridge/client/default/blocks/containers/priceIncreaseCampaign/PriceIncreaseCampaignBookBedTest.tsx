import './PriceIncreaseCampaignBookBedTest.scss';

import React, { ReactElement, useRef, useState } from 'react';
import clsx from 'clsx';

import { Button } from '../../../shared/components/formFields/Button';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../shared/components/AnimatedSteps';
import { BookBedTest, BookBedTestText } from '../../../shared/components/BookBedTest/BookBedTest';
import { scrollIntoView } from '../../../shared/helpers';
import { useServer } from '../../server/ServerProvider';

interface PriceIncreaseCampaignBookBedTestContent {
    text: BookBedTestText & {
        bannerHeading: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function PriceIncreaseCampaignBookBedTest(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<PriceIncreaseCampaignBookBedTestContent>();
    const rootRef = useRef<HTMLDivElement>();
    const scrollTargetRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);

    function expand() {
        scrollIntoView(scrollTargetRef.current).then(() => {
            setExpanded(true);
        });
    }

    function collapse() {
        setExpanded(false);
        setTimeout(() => {
            rootRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 600);
    }

    return (
        <div className="has-price-increase-campaign__book-bed-test" ref={rootRef}>
            <div className="banner">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{text.bannerHeading}</Heading>
                    <Paragraph>{text.bannerBody}</Paragraph>
                    <div className="button-wrapper">
                        <Button
                            className={clsx('link', getTrackingClassId('bedtest', 'cta'))}
                            color="dark"
                            onClick={() => {
                                expand();
                            }}>
                            {text.bannerButton}
                        </Button>
                    </div>
                </div>
                <div className="scroll-target" ref={scrollTargetRef}></div>
            </div>
            <div className="expandable-view">
                <AnimatedSteps index={expanded ? 0 : -1}>
                    <BookBedTest
                        text={text}
                        onCloseClick={() => {
                            collapse();
                        }}
                    />
                </AnimatedSteps>
            </div>
        </div>
    );
}
