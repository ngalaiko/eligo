<script lang="ts">
	import { Card, Form, useItems } from '$lib/items';
	import type { PageData } from './$types';
	import { usePicks } from '$lib/picks';
	import { getWeights } from '@eligo/protocol';

	export let data: PageData;
	const items = useItems({ listId: data.listId });
	const picks = usePicks({ listId: data.listId });
	$: weights = getWeights($items.list, $picks.list);
	$: weightsSum = Object.values(weights).reduce((a, b) => a + b, 0);
	$: chances = Object.fromEntries(
		Object.entries(weights).map(([itemId, weight]) => [itemId, weight / weightsSum])
	);
</script>

<Form listId={data.listId} />

<ul class="overflow-y-scroll flex flex-col gap-2">
	{#each $items.list.sort((a, b) => chances[b.id] - chances[a.id]) as item}
		{@const chance = chances[item.id]}
		{#if item.isLoading === false}
			<li>
				<Card {item} {chance} />
			</li>
		{/if}
	{/each}
</ul>
