<script lang="ts">
	import { Distance } from '$lib/time';
	import { create, list as picks } from '$lib/picks';
	import { list as items } from '$lib/items';
	import type { PageData } from './$types';

	export let data: PageData;

	const onPickClicked = () => create({ listId: data.listId });

	$: latestPick = $picks
		.filter((p) => p.listId === data.listId)
		.reduce((latest, pick) => (pick.createTime <= latest.createTime ? latest : pick), $picks[0]);

	$: item = $items
		.filter((i) => i.listId === data.listId)
		.find(({ id }) => id === latestPick?.itemId);
</script>

<div class="flex flex-col gap-2">
	{#if item}
		<figure class="text-2xl font-semibold flex flex-col items-center text-center">
			<span>{item.text}</span>
			<span class="flex gap-1 opacity-50 text-sm">
				<Distance to={latestPick.createTime} />
			</span>
		</figure>
	{/if}

	<button on:click|preventDefault={onPickClicked} class="underline">next</button>
</div>
