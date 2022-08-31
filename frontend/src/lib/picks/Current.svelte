<script lang="ts">
	import { usePicks } from '$lib/picks';
	import { useItem } from '$lib/items';
	import { Distance } from '$lib/time';

	export let listId: string;

	const picks = usePicks({ listId });

	$: latest = $picks.list
		.filter(({ isLoading }) => !isLoading)
		.reduce(
			(latest, pick) => (pick.createTime < latest.createTime ? latest : pick),
			$picks.list[0]
		);
	$: item = latest && latest.itemId ? useItem(latest.itemId) : null;
</script>

{#await picks.loading}
	loading...
{:then}
	<figure class="text-2xl font-semibold flex flex-col items-center text-center">
		{#if $item?.isLoading === false}
			<span>{$item.text}</span>
			<span class="flex gap-1 opacity-50 text-sm">
				<Distance to={$item.createTime} />
			</span>
		{/if}
	</figure>
{/await}
