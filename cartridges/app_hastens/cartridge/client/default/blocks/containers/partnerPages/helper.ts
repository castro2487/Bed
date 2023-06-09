import dayjs from 'dayjs';

export interface StoreHours {
    schedule: {
        [weekday: string]: {
            open: string;
            close: string;
        }[];
    };
    overrides: {
        date: string;
        hours: {
            open: string;
            close: string;
        }[];
        weekday: string;
    }[];
    info?: string;
}

export interface ScheduleItemWithDeviations {
    date: string;
    hours: {
        open: string;
        close: string;
    }[];
}

export function getScheduleWithDeviations(storeHours: StoreHours): ScheduleItemWithDeviations[] {
    const scheduleKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const schedule = [];

    for (let index = 0; index < 7; index++) {
        const date = dayjs().add(index, 'day').format('YYYY-MM-DD');
        const weekdayIndex = dayjs().add(index, 'day').format('d');
        const weekday = scheduleKeys[weekdayIndex];

        const override = (storeHours.overrides || []).find((item) => {
            return dayjs(item.date, 'YYYY-MM-DD').isSame(dayjs().add(index, 'day'), 'date');
        });

        schedule.push({
            date,
            hours: (override || {}).hours || storeHours.schedule[weekday] || [],
        });
    }

    return schedule;
}

export function getTodayHours(storeHours: StoreHours): ScheduleItemWithDeviations {
    const schedule = getScheduleWithDeviations(storeHours);
    return schedule.find((item) => item.date === dayjs().format('YYYY-MM-DD'));
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
