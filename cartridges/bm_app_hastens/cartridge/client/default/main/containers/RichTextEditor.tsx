
import './RichTextEditor.scss';

import React, { ReactElement } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { EditorProps } from '..';

interface EditorConfig {
    useExtendedToolBar: boolean;
    plugins: string;
    toolbar: string;
    tinymceContentCssUrl: string;
}

export function RichTextEditor(props: EditorProps<EditorConfig>): ReactElement {

    const inputColumnBreaker = '<p class="mceNonEditable column-breaker">Break Column</p>';
    const outputColumnBreaker = '<!-- columnBreaker -->';

    function onEditorChange(content) {
        props.onChange(convertOutput(content));
    }

    function convertOutput(content) {
        return content.replaceAll(inputColumnBreaker, outputColumnBreaker);
    }

    function convertInput(content) {
        if (!content) {
            return '';
        }
        return content.replaceAll(outputColumnBreaker, inputColumnBreaker);
    }

    const partialToolbarPlugins = [
        'paste', 'noneditable',
    ];
    const fullToolbarPlugins = [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen', 'paste',
    ];
    const partialToolbarConfig = 'bold italic | breakColumnButton';
    const fullToolbarConfig = 'undo redo | formatselect | styleselect | bold italic | bullist numlist | alignleft aligncenter alignright alignjustify | outdent indent | link | removeformat';

    const plugins = props.config.useExtendedToolBar ? fullToolbarPlugins : partialToolbarPlugins;
    const toolbar = props.config.useExtendedToolBar ? fullToolbarConfig : partialToolbarConfig;

    return (
        <Editor
            initialValue={convertInput(props.value)}
            disabled={props.disabled}
            init={{
                height: 500,
                menubar: false,
                convert_urls: false,
                paste_as_text: true,
                plugins: props.config.plugins ? props.config.plugins : plugins,
                toolbar: props.config.toolbar ? props.config.toolbar : toolbar,
                toolbar_mode: 'sliding',
                block_formats: 'Paragraph =p;Heading 1=h2;Heading 2=h3;Heading 3=h4;Heading 4=h5',
                style_formats: [
                    { title: 'XLarge', selector: 'h1,h2,h3,h4,h5,h6', classes: 'x-large' },
                    { title: 'Large', selector: 'h1,h2,h3,h4,h5,h6,p', classes: 'large' },
                    { title: 'Medium', selector: 'h1,h2,h3,h4,h5,h6,p', classes: 'medium' },
                    { title: 'Small', selector: 'h1,h2,h3,h4,h5,h6,p', classes: 'small' },
                    { title: 'XSmall', selector: 'h1,h2,h3,h4,h5,h6,p', classes: 'x-small' },
                ],
                content_css: [
                    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
                    props.config.tinymceContentCssUrl,
                ],
                preview_styles: false,
                style_formats_autohide: true,
                setup: (editor) => {
                    editor.ui.registry.addButton('breakColumnButton', {
                        text: 'Break Column',
                        onAction: () => {
                            editor.insertContent(inputColumnBreaker);
                        },
                    });

                    // Change style formats dropdown label
                    // In order for this to work the block formats dropdown can't use the same text (observe the space after "Paragraph")
                    editor.editorManager.i18n.add('en', { Paragraph: 'Size' });

                    // Allow only one selected item at a time in the style formats dropdown
                    editor.on('BeforeExecCommand', (event) => {
                        const formats = [
                            'custom-xlarge',
                            'custom-large',
                            'custom-medium',
                            'custom-small',
                            'custom-xsmall',
                        ];
                        if (event.command === 'mceToggleFormat' && formats.indexOf(event.value) !== -1) {
                            formats.forEach((format) => {
                                if (format !== event.value) {
                                    editor.formatter.remove(format);
                                }
                            });
                        }
                    });
                },
            }}
            onEditorChange={onEditorChange}
        />
    );
}
