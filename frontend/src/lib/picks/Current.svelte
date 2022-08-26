<script lang="ts">
	import { compareDesc } from 'date-fns';
	import { usePicks } from '$lib/picks';
	import { useItem } from '$lib/items';

	export let listId: string;

	const picks = usePicks({ listId });

	$: latest = $picks.list.reduce(
		(latest, pick) => (compareDesc(latest.createTime, pick.createTime) ? latest : pick),
		$picks.list.slice(-1)[0]
	);
	$: item = latest && latest.itemId ? useItem(latest.itemId) : null;
</script>

{#if $item?.isLoading === false}
	{$item.text}
{:else if $picks.isEmpty}
	nothing
{:else}
	loading...
{/if}
