<script lang="ts">
	import { Card, Form, list as itemsList } from '$lib/items';
	import { list as picksList } from '$lib/picks';
	import { getWeights } from '@eligo/protocol';
	import { list as boostsList } from '$lib/boosts';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	const items = derived(itemsList, (items) => items.filter(({ listId }) => listId === data.listId));
	const boosts = derived(boostsList, (boosts) =>
		boosts.filter(({ listId }) => listId === data.listId)
	);
	const picks = derived(picksList, (picks) => picks.filter(({ listId }) => listId === data.listId));
	const chances = derived([items, picks, boosts], ([items, picks, boosts]) => {
		const weights = getWeights(items, picks, boosts);
		const weightsSum = Object.values(weights).reduce((a, b) => a + b, 0);
		return Object.fromEntries(
			Object.entries(weights).map(([itemId, weight]) => [itemId, weight / weightsSum])
		);
	});
</script>

<Form listId={data.listId} />

<ul class="overflow-y-scroll flex flex-col gap-2">
	{#each $items
		.sort((a, b) => a.text.localeCompare(b.text))
		.sort((a, b) => $chances[b.id] - $chances[a.id]) as item}
		{@const chance = $chances[item.id]}
		<li>
			<Card {item} {chance} />
		</li>
	{/each}
</ul>
