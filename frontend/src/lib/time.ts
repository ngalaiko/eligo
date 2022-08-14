import { differenceInMinutes, differenceInSeconds, formatDistance } from 'date-fns';
import { readable } from 'svelte/store';

export const useDistance = (to: number | Date) =>
	readable(formatDistance(to, new Date(), { addSuffix: true }), (set) => {
		const nextInterval = (to: number | Date) => {
			if (differenceInSeconds(new Date(), to) < 30) {
				return 1000; // 1 second
			} else if (differenceInMinutes(new Date(), to) < 45) {
				return 60 * 1000; // 1 minute
			} else {
				return 60 * 60 * 1000; // 1 hour
			}
		};
		let interval: ReturnType<typeof setInterval>;
		const getInterval = () =>
			setInterval(() => {
				set(formatDistance(to, new Date(), { addSuffix: true }));
				clearInterval(interval);
				interval = getInterval();
			}, nextInterval(to));
		interval = getInterval();
		return () => clearInterval(interval);
	});
