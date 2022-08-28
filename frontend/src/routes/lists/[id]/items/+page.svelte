<script lang="ts">
	import { Card, Form, useItems } from '$lib/items';
	import type { PageData } from './$types';
	import { usePicks } from '$lib/picks';
	import { getWeights } from '@eligo/protocol';
	import { useBoosts } from '$lib/boosts';
	import { derived } from 'svelte/store';

	export let data: PageData;
	const items = derived(useItems({ listId: data.listId }), (items) =>
		items.sort((a, b) => a.text.localeCompare(b.text))
	);
	const boosts = useBoosts({ listId: data.listId });
	const chances = derived(
		[items, usePicks({ listId: data.listId }), boosts],
		([items, picks, boosts]) => {
			const weights = getWeights(items, picks, boosts);
			const weightsSum = Object.values(weights).reduce((a, b) => a + b, 0);
			return Object.fromEntries(
				Object.entries(weights).map(([itemId, weight]) => [itemId, weight / weightsSum])
			);
		}
	);
</script>

<Form listId={data.listId} />

<ul class="overflow-y-scroll flex flex-col gap-2">
	{#each $items.sort((a, b) => $chances[b.id] - $chances[a.id]) as item}
		{@const chance = $chances[item.id]}
		<li>
			<Card {item} {chance} />
		</li>
	{/each}
</ul>
