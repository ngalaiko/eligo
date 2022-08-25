<script lang="ts">
	import { Form, Card, useItems } from '$lib/items';
	import { compareDesc } from 'date-fns';

	export let listId: string;
	const items = useItems({ listId });
</script>

<ul class="grid grid-cols-1 gap-2">
	<li>
		<Form {listId} />
	</li>
	{#each $items.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as item}
		{#if item.isLoading === false}
			<li>
				<Card {item} />
			</li>
		{/if}
	{/each}
</ul>
