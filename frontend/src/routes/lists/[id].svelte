<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params: { id } }) => ({
		props: { listId: id }
	});
</script>

<script lang="ts">
	import { createItem, useItems, Card as ItemCard } from '$lib/items';
	import { createPick, usePicks, Card as PickCard } from '$lib/picks';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';
	import { compareAsc, compareDesc } from 'date-fns';

	export let listId: string;

	const client = useClient();
	const items = useItems({ listId });
	const picks = usePicks({ listId });

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
	const pick = async () => {
		if (!$session.user?.id) return;
		if ($items.isEmpty) return;
		await createPick(client, {
			listId,
			userId: $session.user.id,
			createTime: new Date().getTime()
		});
	};
</script>

<form on:submit|preventDefault={create}>
	<input type="text" name="title" bind:value={text} />
	<button disabled={!text || !$session.user}>new item</button>
</form>
<ul>
	{#each $items.list.sort((a, b) => compareAsc(a.createTime, b.createTime)) as item}
		{#if item.isLoading == false}
			<li><ItemCard {item} /></li>
		{/if}
	{/each}
	{#if $items.isLoading}
		<li>loading...</li>
	{/if}
</ul>

<hr />

<h2>rolls</h2>
<button disabled={$items.isEmpty || !$session.user} on:click={pick}>roll</button>
<ul>
	{#each $picks.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as pick}
		{#if pick.isLoading == false}
			<li><PickCard {pick} /></li>
		{/if}
	{/each}
</ul>
