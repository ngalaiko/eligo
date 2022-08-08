<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params: { id } }) => ({
		props: {
			listId: id
		}
	});
</script>

<script lang="ts">
	import { useClient } from '$lib/logux';
	import { useList } from '$lib/lists';
	import { createItem, useItems } from '$lib/items';
	import { createRoll, useRolls } from '$lib/rolls';

	export let listId: string;

	const client = useClient();
	$: items = useItems($client, { listId });
	$: list = useList($client, { id: listId });
	$: rolls = useRolls($client, { listId });

	let text: string;
	const create = () => createItem($client, { listId, text }).then(() => (text = ''));
	const roll = () => createRoll($client, { listId });
</script>

{#if !$client}
	connecting...
{:else if $list.isEmpty}
	not found
{:else if $list.isLoading}
	loading...
{:else}
	<h1>{$list.title}</h1>
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={text} />
		<button>new item</button>
	</form>
	<ul>
		{#each $items.list as item}
			<li>{item.text}</li>
		{/each}
		{#if $items.isLoading}
			<li>loading...</li>
		{/if}
	</ul>

	<hr />
	<h2>rolls</h2>
	<button on:click={roll}>roll</button>
	<ul>
		{#each $rolls.list as roll}
			<li>{roll.itemId}</li>
		{/each}
		{#if $rolls.isLoading}
			<li>loading...</li>
		{/if}
	</ul>
{/if}
