<script lang="ts">
	import { Distance } from '$lib/time';
	import { create, list as picks } from '$lib/picks';
	import { list as items } from '$lib/items';
	import type { PageData } from './$types';
	import { secondsToMilliseconds } from 'date-fns';

	export let data: PageData;

	const delay = secondsToMilliseconds(0.5);
	const updateEvery = delay / 100;
	let timeout: ReturnType<typeof setTimeout>;
	let interval: ReturnType<typeof setInterval>;

	$: percentage = 0;

	const reset = () => {
		clearTimeout(timeout);
		clearInterval(interval);
		percentage = 0;
	};

	const init = () => {
		timeout = setTimeout(() => {
			create({ listId: data.listId });
			reset();
		}, delay);
		interval = setInterval(() => percentage++, updateEvery);
	};

	$: latestPick = $picks
		.filter((p) => p.listId === data.listId)
		.reduce((latest, pick) => (pick.createTime <= latest.createTime ? latest : pick), $picks[0]);

	$: item = $items
		.filter((i) => i.listId === data.listId)
		.find(({ id }) => id === latestPick?.itemId);
</script>

<div class="flex flex-col gap-2 items-center">
	{#if item}
		<figure class="text-2xl font-semibold flex flex-col items-center text-center">
			<span>{item.text}</span>
			<span class="flex gap-1 opacity-50 text-sm">
				<Distance to={latestPick.createTime} />
			</span>
		</figure>
	{/if}

	<div
		class="border-2 px-2 py-1 rounded-2xl bg-gray-300 flex w-1/6"
		style:background="linear-gradient(90deg, var(--color-gray-300) {percentage}%, var(--color-white) {percentage}%)"
	>
		<div style:width="{percentage}%" class="bg-500 absolute" />
		<button
			class="underline flex-1"
			on:mousedown|preventDefault={init}
			on:mouseup|preventDefault={reset}>next</button
		>
	</div>
</div>
