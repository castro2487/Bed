import './BookBedTest2.scss';

import React, { ReactElement, useRef, useState } from 'react';

import { useServer } from '../../../server/ServerProvider';
import { BookBedTestText, BookBedTest } from '../../../../shared/components/BookBedTest/BookBedTest';
import { Button } from '../../../../shared/components/formFields/Button';
import { addSups, scrollIntoView } from '../../../../shared/helpers';
import { Heading } from '../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../shared/components/typography/Paragraph';
import AnimatedSteps from '../../../../shared/components/AnimatedSteps';

interface BookBedTest2Content {
    text: BookBedTestText & {
        bannerHeading: string;
        bannerBody: string;
        bannerButton: string;
        afterBannerHeading: string;
    };
}

export function BookBedTest2(): ReactElement {
    const { getTrackingClassId, content: { text } } = useServer<BookBedTest2Content>();
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
        <div className="has-book-a-bed-test-2">
            <div className="banner" ref={bannerRef}>
                <div className="text">
                    <header>
                        <Heading level={2} size="md">{addSups(text.bannerHeading)}</Heading>
                        <p>{text.afterBannerHeading}</p>
                    </header>
                    <Paragraph className="body">{text.bannerBody}</Paragraph>
                    <div className="buttons">
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
