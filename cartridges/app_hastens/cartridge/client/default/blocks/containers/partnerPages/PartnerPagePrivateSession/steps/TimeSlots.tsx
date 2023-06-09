import './TimeSlots.scss';

import React, { useEffect, useState } from 'react';
import { duration, ThemeProvider } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import dayjs, { Dayjs } from 'dayjs';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import uniqBy from 'lodash/uniqBy';

import { useServer } from '../../../../server/ServerProvider';
import { dateFormat, ServerContent } from './../PartnerPagePrivateSession';
import { Button } from '../../../../../shared/components/formFields/Button';
import { lightTheme } from '../../../../../shared/muiTheme';
import DatePicker from '../../../../../shared/components/formFields/DatePicker';
import { Heading } from '../../../../../shared/components/typography/Heading';
import { Paragraph } from '../../../../../shared/components/typography/Paragraph';
import { PrivateSessionRequestData, TimeSlot } from '../../../../server/PrivateSessionService';

interface Props {
    formData: PrivateSessionRequestData;
    onChangeFormData: (formData) => void;
    onCancelClick: () => void;
    onNextClick: () => void;
}

export default function TimeSlots(props: Props) {

    const { content, privateSessionService } = useServer<ServerContent>();
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [pendingTimeSlots, setPendingTimeSlots] = useState(false);
    const visibleTimeSlots = availableTimeSlots.filter((availableTimeSlot) => availableTimeSlot.date === props.formData.date);

    useEffect(() => {
        let componentHasUnmounted = false;
        setPendingTimeSlots(true);
        privateSessionService.getAvailableTimeSlots(content.store.partnerSlug).then((response) => {
            if (componentHasUnmounted === false) {
                setPendingTimeSlots(false);
                setAvailableTimeSlots(response.dates);
            }
        });
        return () => {
            componentHasUnmounted = true;
        };
    }, []);

    function getBadgeDates(): Dayjs[] {
        return uniqBy(availableTimeSlots, 'date').map((timeslot) => dayjs(timeslot.date, dateFormat));
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <div className="has-partner-page_private-session_time-slots">
                <div className="content-wrapper">
                    <Heading level={2} size="sm" className="heading">{content.texts.formHeading}</Heading>
                    <Paragraph className="body">{content.texts.formBody}</Paragraph>
                    <div className="pickers">
                        <Paper elevation={2} className="date-picker">
                            <DatePicker
                                id="date-picker"
                                badges={getBadgeDates()}
                                value={dayjs(props.formData.date, dateFormat)}
                                onChange={(date) => {
                                    props.onChangeFormData({ date: date.format(dateFormat) });
                                    props.onChangeFormData({ from: undefined, to: undefined });
                                }}
                            />
                        </Paper>
                        <Paper elevation={2} className="time-slots">
                            {pendingTimeSlots && (
                                <LinearProgress classes={{ root: 'progress', bar: 'bar' }} />
                            )}
                            {visibleTimeSlots.length === 0 && pendingTimeSlots === false && (
                                <p className="no-time-slots-message">{content.texts.noTimeSlots}</p>
                            )}
                            <Fade in={visibleTimeSlots.length > 0} timeout={{ enter: duration.enteringScreen, exit: 0 }} unmountOnExit>
                                <List component="nav" classes={{ root: 'list' }}>
                                    {visibleTimeSlots.map((timeSlot, index) => (
                                        <ListItem
                                            classes={{ root: 'list-item' }}
                                            button
                                            key={index}
                                            selected={isEqual(pick(props.formData, ['date', 'from', 'to']), timeSlot)}
                                            onClick={() => {
                                                props.onChangeFormData(timeSlot);
                                            }}>
                                            <ListItemText
                                                classes={{ primary: 'list-item-text' }}
                                                primary={`${dayjs(timeSlot.from, 'HH:mm').format('LT')} - ${dayjs(timeSlot.to, 'HH:mm').format('LT')}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Fade>
                        </Paper>
                    </div>
                    <div className="button-container">
                        <Button
                            color="secondary"
                            onClick={props.onCancelClick}>
                            {content.texts.buttonCancel}
                        </Button>
                        <Button
                            disabled={!props.formData.date || !props.formData.from || !props.formData.to}
                            color="secondary"
                            onClick={props.onNextClick}>
                            {content.texts.buttonNext}
                        </Button>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );

}
