<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params: { id } }) => ({
		props: {
			listId: id
		}
	});
</script>

<script lang="ts">
	import { createSyncMap } from '@logux/client';
	import { nanoid } from 'nanoid';
	import { useClient } from '$lib/logux';
	import { useList } from '$lib/lists';
	import { store, useItems } from '$lib/items';

	export let listId: string;

	const client = useClient();
	$: items = useItems($client);
	$: list = useList($client, { id: listId });

	let text: string;
	const create = () =>
		createSyncMap($client, store, {
			id: nanoid(),
			text
		}).then(() => (text = ''));
</script>

{#if $client}
	{#if $list}
		<h1>{$list.title}</h1>
		<form on:submit|preventDefault={create}>
			<input type="text" name="title" bind:value={text} />
			<button>new item</button>
		</form>
		<ul>
			{#each $items.list as list}
				<li><a href={`/lists/${list.id}`}>{list.title}</a></li>
			{/each}
			{#await items.loading}
				<li>loading...</li>
			{/await}
		</ul>
	{:else}
		Not found
	{/if}
{:else}
	connecting...
{/if}
