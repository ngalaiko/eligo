<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params: { id } }) => ({
		props: { listId: id }
	});
</script>

<script lang="ts">
	import { createItem, useItems } from '$lib/items';
	import { createRoll, useRolls } from '$lib/rolls';
	import { useLists } from '$lib/lists';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';

	export let listId: string;

	const client = useClient();
	const lists = useLists();
	$: list = $lists.list.find((list) => list.id === listId);
	const items = useItems({ listId });
	const rolls = useRolls({ listId });

	let text: string;
	const create = async () => {
		if (!text) return;
		if (!$session.userId) return;
		await createItem(client, { listId, text, userId: $session.userId }).then(() => (text = ''));
	};
	const roll = async () => {
		if (!$session.userId) return;
		if ($items.isEmpty) return;
		await createRoll(client, { listId, userId: $session.userId });
	};
</script>

{#if $lists.isLoading}
	loading...
{:else if !list}
	not found
{:else}
	<h1>{list.title}</h1>
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={text} />
		<button disabled={!text || !$session.userId}>new item</button>
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
	<button disabled={$items.isEmpty || !$session.userId} on:click={roll}>roll</button>
	<ul>
		{#each $rolls.list as roll}
			{@const rolledItem = $items.list.find((list) => list.id === roll.itemId)}
			{#if rolledItem}
				<li>{rolledItem.text}</li>
			{:else}
				<li>rolling...</li>
			{/if}
		{/each}
	</ul>
{/if}
