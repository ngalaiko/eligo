<script lang="ts">
	import { differenceInMinutes, differenceInSeconds, isAfter } from 'date-fns';
	import {
		differenceInDays,
		differenceInWeeks,
		formatDistance,
		format as fmt,
		isSameWeek,
		isSameDay
	} from 'date-fns';
	import { onMount } from 'svelte';

	let className = '';
	export let to: Date | number;
	export { className as class };
	const datetime = new Date(to).toLocaleString();

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

	$: now = new Date();
	$: if (isAfter(to, now)) now = new Date();

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
			now = new Date();
			clearInterval(interval);
			interval = getInterval();
		}, nextInterval(to));

	onMount(() => {
		interval = getInterval();
		return () => clearInterval(interval);
	});
</script>

<time class="whitespace-nowrap {className}" title={datetime} {datetime}>
	{format(to, now)}
</time>
