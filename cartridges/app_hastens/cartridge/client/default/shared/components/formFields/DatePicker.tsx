import React from 'react';
import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles';
import { DatePicker as MuiDatePicker } from '@material-ui/pickers';
import { Dayjs } from 'dayjs';

interface Props {
    id: string;
    value: Dayjs;
    onChange: (date: Dayjs) => void;
    badges: Dayjs[];
}

DatePicker.defaultProps = {
    value: null,
    badges: [],
};

const useStyles = makeStyles({
    badge: {
        height: 4,
        minWidth: 4,
        left: '50%',
        bottom: '15%',
    },
});

export default function DatePicker(props: Props) {

    const classes = useStyles();

    return (
        <MuiDatePicker
            autoOk
            disableToolbar
            disablePast
            variant="static"
            renderDay={(day, selectedDate, dayInCurrentMonth, dayComponent) => {
                const shouldDisplayBadge = !!props.badges.find((badge) => badge.isSame(day, 'day'));
                if (shouldDisplayBadge && dayInCurrentMonth) {
                    return (
                        <Badge
                            variant="dot"
                            color="primary"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            classes={{ badge: classes.badge }}>
                            {dayComponent}
                        </Badge>
                    );
                }
                return dayComponent;
            }}
            id={props.id}
            value={props.value}
            onChange={props.onChange}
        />
    );

}
