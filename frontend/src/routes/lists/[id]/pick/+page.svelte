<script lang="ts">
	import { usePicks, createPick } from '$lib/picks';
	import { useAuth, useClient } from '$lib/logux';
	import { useItem } from '$lib/items';
	import type { PageData } from './$types';
	import { Distance } from '$lib/time';
	import { derived, type Readable } from 'svelte/store';
	import type { Pick } from '@eligo/protocol';

	export let data: PageData;

	const client = useClient();
	const auth = useAuth();

	const pick = async () => {
		await createPick(client, {
			listId: data.listId,
			userId: $auth.userId,
			createTime: new Date().getTime()
		});
	};

	const latestPick: Readable<{ isLoading: boolean; isEmpty: boolean } & Partial<Pick>> = derived(
		usePicks({ listId: data.listId }),
		(picks) => {
			if (picks.isLoading) return { isLoading: true, isEmpty: false };
			if (picks.list.some(({ isLoading }) => isLoading)) return { isLoading: true, isEmpty: false };
			if (picks.isEmpty) return { isLoading: false, isEmpty: true };
			return {
				...picks.list.reduce(
					(latest, pick) => (pick.createTime <= latest.createTime ? latest : pick),
					picks.list[0]
				),
				isLoading: false,
				isEmpty: false
			};
		}
	);

	$: item =
		!$latestPick.isLoading && !$latestPick.isEmpty && $latestPick.itemId
			? useItem($latestPick.itemId)
			: null;
</script>

<div class="flex flex-col gap-2">
	<figure class="text-2xl font-semibold flex flex-col items-center text-center">
		{#await $latestPick.isLoading}
			loading...
		{:then}
			{#await item?.loading}
				loading...
			{:then}
				{#if $item?.isLoading === false}
					<span>{$item.text}</span>
					<span class="flex gap-1 opacity-50 text-sm">
						<Distance to={$latestPick.createTime} />
					</span>
				{/if}
			{/await}
		{/await}
	</figure>

	<button on:click|preventDefault={pick} disabled={$latestPick.isLoading} class="underline">
		next
	</button>
</div>
