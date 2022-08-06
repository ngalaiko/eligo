<script lang="ts">
	import { createSyncMap } from '@logux/client';
	import { nanoid } from 'nanoid';
	import { useClient, useFilter } from '$lib/logux';
	import { Item } from '$lib/stores/item';

	const client = useClient();
	$: items = useFilter($client, Item);

	const create = () =>
		createSyncMap($client, Item, {
			id: nanoid(),
			text: 'test'
		});
</script>

{#if $client}
	{#await items.loading}
		loading...
	{:then}
		<button on:click={create}>create item</button>
		<ul>
			{#each $items.list as item}
				<li>{item.text}</li>
			{/each}
		</ul>
	{/await}
{:else}
	connecting...
{/if}
