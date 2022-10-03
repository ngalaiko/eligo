import {
	differenceInDays,
	differenceInWeeks,
	formatDistance,
	format as fmt,
	isSameWeek,
	isSameDay
} from 'date-fns';

export const format = (to: Date | number, from: Date | number) => {
	if (differenceInDays(from, to) < 1) {
		if (isSameDay(from, to)) {
			return formatDistance(to, from, { addSuffix: true });
		} else {
			return 'yesterday';
		}
	} else if (differenceInWeeks(from, to) < 1 && isSameWeek(from, to)) {
		return fmt(to, 'EEEE'); // Monday, Tuesday, ..., Sunday
	} else if (differenceInWeeks(from, to) == 0 && !isSameWeek(from, to)) {
		return `last ${fmt(to, 'EEEE')}`; // Monday, Tuesday, ..., Sunday
	} else {
		return formatDistance(to, from, { addSuffix: true });
	}
};
