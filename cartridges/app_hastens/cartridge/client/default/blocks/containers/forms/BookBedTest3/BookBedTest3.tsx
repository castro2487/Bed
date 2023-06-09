import './BookBedTest3.scss';

import React, { ReactElement, useRef, useState } from 'react';
import clsx from 'clsx';

import { useServer } from '../../../server/ServerProvider';
import { Button } from '../../../../shared/components/formFields/Button';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';
import { BookBedTest, BookBedTestText } from '../../../../shared/components/BookBedTest/BookBedTest';
import { scrollIntoView } from '../../../../shared/helpers';

interface BookBedTest3Content {
    text: BookBedTestText & {
        bannerHeading: string;
        bannerHeading2: string;
        bannerBody: string;
        bannerButton: string;
    };
}

export default function BookBedTest3(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<BookBedTest3Content>();
    const bannerRef = useRef<HTMLDivElement>();
    const expandedViewRef = useRef<HTMLDivElement>();
    const [expanded, setExpanded] = useState(false);

    function expand() {
        scrollIntoView(expandedViewRef.current).then(() => {
            setExpanded(true);
        });
    }

    function collapse() {
        setExpanded(false);
        setTimeout(() => {
            bannerRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 600);
    }

    return (
        <div className="has-book-a-bed-test-3">
            <div className={clsx('banner', { 'with-border': !expanded })} ref={bannerRef}>
                <div className="text">
                    <header>
                        <Heading level={2} size="lg">{text.bannerHeading}<span>{text.bannerHeading2}</span></Heading>
                    </header>
                    <div className="image"></div>
                    <Paragraph className="body">{text.bannerBody}</Paragraph>
                    <Button
                        className={getTrackingClassId('bedtest', 'cta')}
                        color="light"
                        onClick={() => {
                            expand();
                        }}>
                        {text.bannerButton}
                    </Button>
                </div>
            </div>
            <div className="expandable-view" ref={expandedViewRef}>
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
