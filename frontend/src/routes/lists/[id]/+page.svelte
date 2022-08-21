<script lang="ts">
	import { createItem, useItems, Card as ItemCard } from '$lib/items';
	import { createPick, usePicks, Card as PickCard } from '$lib/picks';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';
	import { compareDesc } from 'date-fns';
	import type { PageData } from './$types';
	import { updateList, useList } from '$lib/lists';
	import { nanoid } from 'nanoid';

	export let data: PageData;

	const client = useClient();
	const items = useItems({ listId: data.listId });
	const picks = usePicks({ listId: data.listId });
	const list = useList(data.listId);

	let text: string;
	const create = async () => {
		if (!text) return;
		if (!$session.user?.id) return;
		await createItem(client, {
			listId: data.listId,
			text,
			userId: $session.user.id,
			createTime: new Date().getTime()
		}).then(() => (text = ''));
	};
	const pick = async () => {
		if (!$session.user?.id) return;
		if ($items.isEmpty) return;
		await createPick(client, {
			listId: data.listId,
			userId: $session.user.id,
			createTime: new Date().getTime()
		});
	};
	const createInviteLink = () =>
		updateList(client, data.listId, {
			invitatationId: nanoid()
		});

	const deleteInviteLink = () =>
		updateList(client, data.listId, {
			invitatationId: null
		});

	const copyInviteLink = () => {
		if ($list.isLoading === true) return;
		navigator.clipboard.writeText(`${window.location.origin}/join/${$list.invitatationId}/`);
	};
</script>

<div class="grid gap-6">
	<div>
		{#if $list.isLoading}
			loading...
		{:else if $list.isLoading === false}
			{#if $list.invitatationId}
				<span>Invite link:</span>
				<input
					type="text"
					value={`${window.location.origin}/join/${$list.invitatationId}/`}
					disabled
				/>
				<button on:click={copyInviteLink}>Copy</button>
				<button on:click={deleteInviteLink}>Remove </button>
			{:else}
				<button on:click={createInviteLink}>Create invite link</button>
			{/if}
		{/if}
	</div>

	<ul class="flex gap-4 overflow-auto">
		<li class="w-36">
			<button
				disabled={$items.isEmpty || !$session.user}
				on:click={pick}
				class="border-2 border-black flex flex-col p-2 justify-around h-full w-full "
				class:hover:shadow-lg={!$items.isEmpty && $session.user}
				class:hover:bg-yellow-100={!$items.isEmpty && $session.user}
				class:opacity-50={$items.isEmpty || !$session.user}
			>
				next
			</button>
		</li>
		{#each $picks.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as pick}
			{#if pick.isLoading == false}
				<li class="w-36"><PickCard {pick} /></li>
			{/if}
		{/each}
	</ul>

	<ul class="grid grid-cols-3 gap-4">
		<li>
			<form
				on:submit|preventDefault={create}
				class="border-2 border-black flex flex-col p-2 justify-end h-full"
			>
				<button type="submit" hidden />
				<input type="text" name="title" bind:value={text} placeholder="new item..." />
			</form>
		</li>
		{#each $items.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as item}
			{#if item.isLoading === false}
				<li><ItemCard {item} /></li>
			{/if}
		{/each}
	</ul>
</div>
