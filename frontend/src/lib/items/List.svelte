<script lang="ts">
	import { Form, Card, useItems } from '$lib/items';
	import { usePicks } from '$lib/picks';
	import { getWeights } from '@eligo/protocol';

	export let listId: string;
	const items = useItems({ listId });
	const picks = usePicks({ listId });
	$: weights = getWeights($items.list, $picks.list);
	$: weightsSum = Object.values(weights).reduce((a, b) => a + b, 0);
	$: chances = Object.fromEntries(
		Object.entries(weights).map(([itemId, weight]) => [itemId, weight / weightsSum])
	);
</script>

<ul class="grid grid-cols-1 gap-2">
	<li>
		<Form {listId} />
	</li>
	{#each $items.list.sort((a, b) => chances[b.id] - chances[a.id]) as item}
		{@const chance = chances[item.id]}
		{#if item.isLoading === false}
			<li>
				<Card {item} {chance} />
			</li>
		{/if}
	{/each}
</ul>
