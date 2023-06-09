import React from 'react';
import { Heading } from '../../../shared/components/typography/Heading';
import { Paragraph } from '../../../shared/components/typography/Paragraph';
import { useServer } from '../../server/ServerProvider';

import './PartnerPageTeam.scss';

interface Member {
    name: string;
    title: string;
    phone?: string;
    email?: string;
    image?: string;
}

interface TeamContent {
    members: Member[];
    showEmployees: boolean;
    text: {
        siteLang: string;
        header: string;
        body: string;
    };
}

export function PartnerPageTeam() {
    const { content: { members, showEmployees, text } } = useServer<TeamContent>();

    return showEmployees && members && Array.isArray(members) ? (
        <div className="has-partner-page-team">
            <header>
                <Heading level={2} size="md">{text.header}</Heading>
                <Paragraph className="mt-4">{text.body}</Paragraph>
            </header>
            <div className="employee-group">
                <div className="header">
                    <Heading level={3} size="sm"> Hästens</Heading>
                </div>
                <div className="content">
                    <ul className="employees">
                        {members.map((member, index) => (
                            <li key={index}>
                                <div className="employee-image ">
                                    {member.image ? (
                                        <div className="img" style={{ background: `url(${member.image})` }} />
                                    ) : (
                                        <div className="placeholder" />
                                    )}
                                </div>
                                <h4>{member.name}</h4>
                                <p className="title">{member.title}</p>
                                {member.phone && <a href={`tel:${member.phone}`} target="_self">{member.phone}</a>}
                                {member.email && <a href={`mailto:${member.email}`} target="_self">{member.email}</a>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    ) : (
        null
    );
}
