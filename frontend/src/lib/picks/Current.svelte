<script lang="ts">
	import { usePicks } from '$lib/picks';
	import { useItem } from '$lib/items';
	import { Distance } from '$lib/time';

	export let listId: string;

	const picks = usePicks({ listId });

	$: latest = $picks.reduce(
		(latest, pick) => (pick.createTime < latest.createTime ? latest : pick),
		$picks[0]
	);
	$: item = latest && latest.itemId ? useItem(latest.itemId) : null;
</script>

<figure class="text-2xl font-semibold flex flex-col items-center text-center">
	{#if $item?.isLoading === false}
		<span>{$item.text}</span>
		<span class="flex gap-1 opacity-50 text-sm">
			<Distance to={$item.createTime} />
		</span>
	{:else if $picks.length > 0}
		loading...
	{/if}
</figure>
