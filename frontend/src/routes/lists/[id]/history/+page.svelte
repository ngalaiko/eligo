<script lang="ts">
	import { useBoosts } from '$lib/boosts';
	import { useItems } from '$lib/items';
	import { useMemberships } from '$lib/memberships';
	import { usePicks } from '$lib/picks';
	import { compareDesc } from 'date-fns';
	import { Distance } from '$lib/time';
	import { Single as User } from '$lib/users';
	import { Single as Item } from '$lib/items';

	import type { PageData } from './$types';
	import { derived } from 'svelte/store';
	export let data: PageData;

	const items = useItems({ listId: data.listId });
	const membersips = useMemberships({ listId: data.listId });
	const picks = usePicks({ listId: data.listId });
	const boosts = useBoosts({ listId: data.listId });

	const entries = derived(
		[items, membersips, picks, boosts],
		([items, memberships, picks, boosts]) =>
			[
				...items.list
					.filter(({ isLoading }) => !isLoading)
					.map((item) => ({
						type: 'items/created',
						userId: item.userId,
						time: item.createTime,
						itemId: item.id
					})),
				...memberships.list
					.filter(({ isLoading }) => !isLoading)
					.map((membership) => ({
						type: 'memberships/created',
						userId: membership.userId,
						time: membership.createTime,
						itemId: undefined
					})),
				...picks.list
					.filter(({ isLoading }) => !isLoading)
					.filter((p) => !!p.itemId)
					.map((pick) => ({
						type: 'picks/created',
						userId: pick.userId,
						time: pick.createTime,
						itemId: pick.itemId
					})),
				...boosts.list
					.filter(({ isLoading }) => !isLoading)
					.map((boost) => ({
						type: 'boosts/created',
						userId: boost.userId,
						time: boost.createTime,
						itemId: boost.itemId
					}))
			].sort((a, b) => compareDesc(a.time, b.time))
	);
</script>

<ul class="overflow-y-scroll flex flex-col gap-2">
	{#await Promise.all([items.loading, membersips.loading, picks.loading, boosts.loading])}
		loading...
	{:then}
		{#each $entries.sort((a, b) => compareDesc(a.time, b.time)) as entry}
			<li class="flex gap-1">
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
	{/await}
</ul>
