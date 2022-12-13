<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Distance } from '$lib/components';
	import { enhance } from '$app/forms';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';
	import { Map } from '$lib/components';
	import { merge } from '$lib';

	export let data: PageData;

	$: pick = derived(ws.picks.list, (picks) => {
		picks = merge(picks, data.pick ? [data.pick] : []).filter(
			({ listId }) => listId === data.list.id
		);
		return picks.reduce(
			(latest, pick) => (pick.createTime <= latest?.createTime ? latest : pick),
			picks[0]
		);
	});

	$: items = derived(ws.items.list, (items) =>
		merge(items, data.item ? [data.item] : []).filter(({ listId }) => listId === data.list.id)
	);

	$: item = derived([items, pick], ([items, pick]) => items.find(({ id }) => id === pick?.itemId));
</script>

<div class="flex flex-col gap-2 items-center">
	{#if $item && $pick}
		{#key $pick.id}
			<figure
				in:scale={{ duration: 300, easing: quintOut }}
				class="text-2xl font-semibold flex flex-col items-center text-center"
			>
				<span>{$item.text}</span>
				<span class="flex gap-1 opacity-50 text-sm">
					<Distance to={$pick.createTime} />
				</span>
			</figure>
		{/key}
	{/if}

	<form method="POST" use:enhance>
		<Button type="submit">
			<span class="underline">
				{#if $pick}
					pick another
				{:else}
					pick
				{/if}
			</span>
		</Button>
	</form>
</div>

{#if $item && $item?.coordinates}
	<Map items={[{ title: $item.text, coordinates: $item.coordinates }]} />
{/if}
