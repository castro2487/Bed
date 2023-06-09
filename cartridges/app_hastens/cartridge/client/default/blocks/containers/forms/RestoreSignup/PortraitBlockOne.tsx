import './PortraitBlockOne.scss';

import React from 'react';
import { Button } from '../../../../shared/components/formFields/Button';
import { RestoreSignupContent } from './RestoreSignup';
import { Form } from './Form';

export const PortraitBlockOne: React.FC<RestoreSignupContent> = ({ image, text, mailto }) => {

    const [showForm, setShowForm] = React.useState(false);

    return (
        <section className="has-restore-signup__portrait-1">
            <div className="top-content">
                <h2>{text.heading}</h2>
                <div className="text">
                    <p>{text.subHeading}</p>
                </div>
            </div>
            <div className="bottom-content">
                <div className="image">
                    <img src={image.sizes.desktop?.src} alt={text.heading} />
                </div>
                <div className="text-column text-column-1">
                    {text.text1 && <p>{text.text1}</p>}
                </div>
                <div className="text-column text-column-2">
                    {text.text2 && <p>{text.text2}</p>}
                    {text.text3 && <p>{text.text3}</p>}
                    <div className="btn-container">
                        <Button
                            withArrow={true}
                            color="dark"
                            onClick={() => setShowForm(!showForm)}>
                            {text.buttonText}
                        </Button>
                    </div>
                </div>
            </div>
            <Form
                text={text}
                mailTo={mailto}
                showForm={showForm}
                setShowForm={() => setShowForm(!showForm)}
            />
        </section>
    );
};
