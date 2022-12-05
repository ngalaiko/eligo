<script lang="ts">
	import { Distance } from '$lib/time';
	import type { PageData } from './$types';
	import DelayButton from '$lib/components/DelayButton.svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { connected } from '$lib/api';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';
	import { Map } from '$lib/components';

	export let data: PageData;

	const onClick = () => ws.picks.create({ listId: data.listId });

	const latestPick = derived(ws.picks.list, (picks) =>
		picks
			.filter((p) => p.listId === data.listId)
			.reduce((latest, pick) => (pick.createTime <= latest.createTime ? latest : pick), picks[0])
	);

	const listItems = derived(ws.items.list, (items) =>
		items.filter((i) => i.listId === data.listId)
	);

	const item = derived([listItems, latestPick], ([items, latestPick]) =>
		items.find(({ id }) => id === latestPick?.itemId)
	);
</script>

<div class="flex flex-col gap-2 items-center">
	{#if $item && $latestPick}
		{#key { item, latestPick }}
			<figure
				in:scale={{ duration: 300, easing: quintOut }}
				class="text-2xl font-semibold flex flex-col items-center text-center"
			>
				<span>{$item.text}</span>
				<span class="flex gap-1 opacity-50 text-sm">
					<Distance to={$latestPick.createTime} />
				</span>
			</figure>
		{/key}
	{/if}

	<DelayButton on:click={onClick} disabled={!$connected}>
		<span class="underline flex-1">next</span>
	</DelayButton>
</div>

{#if $item && $item?.coordinates}
	<Map items={[{ title: $item.text, coordinates: $item.coordinates }]} />
{/if}
