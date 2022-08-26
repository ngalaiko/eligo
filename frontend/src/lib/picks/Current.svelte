<script lang="ts">
	import { compareDesc } from 'date-fns';
	import { usePicks } from '$lib/picks';
	import { useItem } from '$lib/items';

	export let listId: string;

	const picks = usePicks({ listId });

	$: latest = $picks.reduce(
		(latest, pick) => (compareDesc(latest.createTime, pick.createTime) ? latest : pick),
		$picks.slice(-1)[0]
	);
	$: item = latest && latest.itemId ? useItem(latest.itemId) : null;
</script>

<figure class="text-2xl font-semibold flex flex-col items-center">
	{#if $item?.isLoading === false}
		<span>{$item.text}</span>
	{:else if $picks.length > 0}
		loading...
	{/if}
</figure>
