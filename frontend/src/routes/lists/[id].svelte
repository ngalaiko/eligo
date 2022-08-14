<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params: { id } }) => ({
		props: { listId: id }
	});
</script>

<script lang="ts">
	import { createItem, useItems, Card as ItemCard } from '$lib/items';
	import { createRoll, useRolls, Card as RollCard } from '$lib/rolls';
	import { useList } from '$lib/lists';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';
	import { compareAsc, compareDesc } from 'date-fns';

	export let listId: string;

	const client = useClient();
	const list = useList(listId);
	const items = useItems({ listId });
	const rolls = useRolls({ listId });

	let text: string;
	const create = async () => {
		if (!text) return;
		if (!$session.user?.id) return;
		await createItem(client, {
			listId,
			text,
			userId: $session.user.id,
			createTime: new Date().getTime()
		}).then(() => (text = ''));
	};
	const roll = async () => {
		if (!$session.user?.id) return;
		if ($items.isEmpty) return;
		await createRoll(client, {
			listId,
			userId: $session.user.id,
			createTime: new Date().getTime()
		});
	};
</script>

{#if $list.isLoading}
	loading...
{:else if $list.isLoading === false}
	<h1>{$list.title}</h1>
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={text} />
		<button disabled={!text || !$session.user}>new item</button>
	</form>
	<ul>
		{#each $items.list.sort((a, b) => compareAsc(a.createTime, b.createTime)) as item}
			<li><ItemCard {item} /></li>
		{/each}
		{#if $items.isLoading}
			<li>loading...</li>
		{/if}
	</ul>

	<hr />

	<h2>rolls</h2>
	<button disabled={$items.isEmpty || !$session.user} on:click={roll}>roll</button>
	<ul>
		{#each $rolls.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as roll}
			<li><RollCard {roll} /></li>
		{/each}
	</ul>
{/if}
