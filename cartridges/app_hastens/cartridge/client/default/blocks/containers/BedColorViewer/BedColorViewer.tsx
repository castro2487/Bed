import './BedColorViewer.scss';

import React, { ReactElement, useState } from 'react';
import clsx from 'clsx';

import { useServer } from '../../server/ServerProvider';
import { ListBox, ListBoxOptionProps } from '../../../shared/components/formFields/ListBox';
import { BedCode, getColors } from './helpers';
import { Heading } from '../../../shared/components/typography/Heading';
import { Background } from '../../../shared/components/Background';

interface BedColorViewerContent {
    bed: BedCode;
    text: {
        heading: string;
        colorLabel: string;
    };
}

interface ColorPickerOption {
    code: string;
    name: string;
    thumbnail: string;
    image: string;
}

export function BedColorViewer(): ReactElement {

    const { content: { bed, text } } = useServer<BedColorViewerContent>();

    const [selectedIndex, setSelectedIndex] = useState(0);

    const colors = getColors(bed);
    const selectedColor = colors[selectedIndex];

    return (
        <div className="has-bed-color-viewer">
            {text.heading && (
                <header className="top-section">
                    <Heading level={2} className="heading">{text.heading}</Heading>
                </header>
            )}
            <div className="main-section">
                {colors.map((color, index) => (
                    <Background
                        key={index}
                        className={clsx('image', { 'selected': selectedIndex === index })}
                        image={{ sizes: {
                            mobile: { src: color.image.replace('static.hastens.com/', 'static.hastens.com/768/') },
                            tablet: { src: color.image.replace('static.hastens.com/', 'static.hastens.com/1200/') },
                            desktop: { src: color.image.replace('static.hastens.com/', 'static.hastens.com/1500/') },
                        } }}
                    />
                ))}
                <div className="controls">
                    <button
                        disabled={selectedIndex === 0}
                        className="prev-button"
                        aria-label="Previous"
                        onClick={() => {
                            setSelectedIndex((previous) => {
                                return previous - 1;
                            });
                        }}>
                        <i className="fa fa-angle-down" aria-hidden="true"></i>
                    </button>
                    <button
                        disabled={selectedIndex === colors.length - 1}
                        className="next-button"
                        aria-label="Next"
                        onClick={() => {
                            setSelectedIndex((previous) => {
                                return previous + 1;
                            });
                        }}>
                        <i className="fa fa-angle-down" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div className="bottom-section">
                {selectedColor && (
                    <p className="selected-name">
                        <span className="label">{text.colorLabel}:</span>
                        <strong className="value">{selectedColor.name}</strong>
                    </p>
                )}
                <ListBox
                    id="color-picker"
                    className="color-picker"
                    aria-label="Select a color"
                    options={colors.map((color, index) => ({ ...color, index }))}
                    optionComponent={OptionComponent}
                    value={selectedIndex}
                    valueKey="index"
                    onChange={(value) => {
                        setSelectedIndex(value);
                    }}
                />
            </div>
        </div>
    );
}

const OptionComponent = (props: ListBoxOptionProps<ColorPickerOption>): ReactElement => (
    <div
        className="thumbnail"
        style={{ backgroundImage: 'url('+props.option.thumbnail.replace('static.hastens.com/', 'static.hastens.com/60/')+')' }}
        aria-label={props.option.name}>
    </div>
);
