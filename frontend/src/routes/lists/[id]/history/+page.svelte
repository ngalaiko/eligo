<script lang="ts">
	import { Distance } from '$lib/components';
	import { Single as User } from '$lib/users';
	import { Single as Item } from '$lib/items';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { ws } from '$lib/api';

	export let data: PageData;

	const items = derived(ws.items.list, (list) =>
		list.filter(({ listId }) => listId === data.listId)
	);
	const memberships = derived(ws.memberships.list, (list) =>
		list.filter(({ listId }) => listId === data.listId)
	);
	const picks = derived(ws.picks.list, (list) =>
		list.filter(({ listId }) => listId === data.listId)
	);
	const boosts = derived(ws.boosts.list, (list) =>
		list.filter(({ listId }) => listId === data.listId)
	);

	const entries = derived(
		[items, picks, memberships, boosts],
		([items, picks, memberships, boosts]) =>
			[
				...items.map((item) => ({
					type: 'items/created',
					userId: item.userId,
					time: item.createTime,
					itemId: item.id
				})),
				...memberships.map((membership) => ({
					type: 'memberships/created',
					userId: membership.userId,
					time: membership.createTime,
					itemId: undefined
				})),
				...picks
					.filter((p) => !!p.itemId)
					.map((pick) => ({
						type: 'picks/created',
						userId: pick.userId,
						time: pick.createTime,
						itemId: pick.itemId
					})),
				...boosts.map((boost) => ({
					type: 'boosts/created',
					userId: boost.userId,
					time: boost.createTime,
					itemId: boost.itemId
				}))
			].sort((a, b) => b.time - a.time)
	);
</script>

<ul class="overflow-y-scroll flex flex-col gap-2 -mr-3">
	{#each $entries.sort((a, b) => b.time - a.time) as entry (entry.time)}
		<li class="flex gap-1 mr-3">
			<User userId={entry.userId} />
			{#if entry.type === 'picks/created'}
				<span>picked</span>
				<Item itemId={entry.itemId} />
			{:else if entry.type === 'memberships/created'}
				<span>joined</span>
			{:else if entry.type === 'items/created'}
				<span>added</span>
				<Item itemId={entry.itemId} />
			{:else if entry.type === 'boosts/created'}
				<span>boosted</span>
				<Item itemId={entry.itemId} />
			{/if}
			<Distance class="flex-1 text-right" to={entry.time} />
		</li>
	{/each}
</ul>
