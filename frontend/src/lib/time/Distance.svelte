<script lang="ts">
	import { differenceInMinutes, differenceInSeconds, formatDistance } from 'date-fns';
	import { onMount } from 'svelte';

	export let to: Date | number;
	const datetime = new Date(to).toLocaleString();

	let now = new Date();

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

<time class="whitespace-nowrap" title={datetime} {datetime}>
	{formatDistance(now, to, { addSuffix: true })}
</time>
