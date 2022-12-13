<script lang="ts">
	import { Distance, List } from '$lib/components';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { ws } from '$lib/api';
	import { merge, notDeleted } from '$lib';

	export let data: PageData;

	$: items = derived(
		ws.items.list,
		(items) =>
			merge(items, data.items)
				.filter(({ listId }) => listId === data.list.id)
				.sort((a, b) => b.createTime - a.createTime) ?? []
	);

	$: memberships = derived(ws.memberships.list, (memberships) =>
		merge(memberships, data.memberships)
			.filter(({ listId }) => listId === data.list.id)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: boosts = derived(ws.boosts.list, (boosts) =>
		merge(boosts, data.boosts)
			.filter(({ listId }) => listId === data.list.id)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: picks = derived(ws.picks.list, (picks) =>
		merge(picks, data.picks)
			.filter(({ listId }) => listId === data.list.id)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: users = derived(ws.users.list, (users) => merge(users, data.users).filter(notDeleted));

	const userName = (id: string) => {
		const user = $users.find((user) => user.id === id);
		return user?.id === data.user.id ? 'you' : user?.displayName ?? user?.name ?? '';
	};

	$: entries = derived(
		[items, picks, memberships, boosts],
		([items, picks, memberships, boosts]) => {
			items = items ?? [];
			picks = picks ?? [];
			memberships = memberships ?? [];
			boosts = boosts ?? [];
			return [
				...items
					.filter(({ deleteTime }) => deleteTime !== undefined && deleteTime !== null)
					.map((item) => ({
						id: `${item.id}.deleted`,
						type: 'items/deleted',
						userId: item.userId,
						time: item.deleteTime!,
						itemId: item.id
					})),
				...items.map((item) => ({
					id: item.id,
					type: 'items/created',
					userId: item.userId,
					time: item.createTime,
					itemId: item.id
				})),
				...memberships.map((membership) => ({
					id: membership.id,
					type: 'memberships/created',
					userId: membership.userId,
					time: membership.createTime,
					itemId: undefined
				})),
				...picks
					.filter((p) => !!p.itemId)
					.map((pick) => ({
						id: pick.id,
						type: 'picks/created',
						userId: pick.userId,
						time: pick.createTime,
						itemId: pick.itemId
					})),
				...boosts.map((boost) => ({
					id: boost.id,
					type: 'boosts/created',
					userId: boost.userId,
					time: boost.createTime,
					itemId: boost.itemId
				}))
			].sort((a, b) => b.time - a.time);
		}
	);
</script>

<List items={$entries} let:item={entry}>
	{@const uname = userName(entry.userId)}
	<div class="flex gap-1">
		<b>{uname} </b>
		{#if entry.type === 'picks/created'}
			<span>picked</span>
			<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
				<b>{$items.find(({ id }) => id == entry.itemId)?.text}</b>
			</span>
		{:else if entry.type === 'memberships/created'}
			<span>joined</span>
		{:else if entry.type === 'items/deleted'}
			<span>deleted</span>
			<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
				<b>{$items.find(({ id }) => id == entry.itemId)?.text}</b>
			</span>
		{:else if entry.type === 'items/created'}
			<span>added</span>
			<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
				<b>{$items.find(({ id }) => id == entry.itemId)?.text}</b>
			</span>
		{:else if entry.type === 'boosts/created'}
			<span>boosted</span>
			<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
				<b>{$items.find(({ id }) => id == entry.itemId)?.text}</b>
			</span>
		{/if}
		<Distance class="flex-1 text-right" to={entry.time} />
	</div>
</List>
