import './WinterCampaignBookBedTest.scss';

import React, { ReactElement, useRef, useState } from 'react';
import clsx from 'clsx';

import { Background } from '../../../shared/components/Background';
import { Button } from '../../../shared/components/formFields/Button';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../shared/components/AnimatedSteps';
import { BookBedTest, BookBedTestText } from '../../../shared/components/BookBedTest/BookBedTest';
import { scrollIntoView } from '../../../shared/helpers';
import { useServer } from '../../server/ServerProvider';

interface WinterCampaignBookBedTestContent {
    text: BookBedTestText & {
        bannerHeading: string;
        bannerHeading2: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function WinterCampaignBookBedTest(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<WinterCampaignBookBedTestContent>();
    const rootRef = useRef<HTMLDivElement>();
    const expandableViewRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);

    function expand() {
        scrollIntoView(expandableViewRef.current).then(() => {
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
        <div className="has-winter-campaign-book-bed-test" ref={rootRef}>
            <Background theme="black-1" className="banner">
                <div className="image"></div>
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{text.bannerHeading} <span>{text.bannerHeading2}</span></Heading>
                    <Paragraph className="body">{text.bannerBody}</Paragraph>
                    <Button
                        className={clsx('link', getTrackingClassId('bedtest', 'cta'))}
                        color="light"
                        onClick={() => {
                            expand();
                        }}>
                        {text.bannerButton}
                    </Button>
                </div>
            </Background>
            <div className="expandable-view" ref={expandableViewRef}>
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
