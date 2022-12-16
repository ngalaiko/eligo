import {
    addDays,
    formatDistance,
    format as fmt,
    isSameDay,
    startOfWeek,
    isAfter,
    addWeeks
} from 'date-fns';

export const format = (to: Date | number, from: Date | number) => {
    if (isSameDay(from, to)) {
        return formatDistance(to, from, { addSuffix: true });
    } else if (isSameDay(to, addDays(from, -1))) {
        return 'yesterday';
    } else if (isAfter(to, startOfWeek(from, { weekStartsOn: 1 }))) {
        return fmt(to, 'EEEE');
    } else if (isAfter(to, startOfWeek(addWeeks(from, -1), { weekStartsOn: 1 }))) {
        return `last ${fmt(to, 'EEEE')}`;
    } else {
        return formatDistance(to, from, { addSuffix: true });
    }
};
