<script lang="ts">
	import type { Pick } from '@eligo/protocol';
	import { useItem } from '$lib/items';
	import { Distance } from '$lib/time';

	export let pick: Pick & { id: string };
	$: item = pick.itemId ? useItem(pick.itemId) : undefined;
</script>

<div
	id={pick.id}
	class="border-2 border-black shadow-md flex flex-col gap-4 p-2 shadow-sm text-ellipsis overflow-hidden"
>
	{#if !item}
		<span>picking...</span>
	{:else if $item.isLoading === false}
		<span class="font-semibold text-lg">{$item.text}</span>
	{/if}

	<div class="opacity-50 text-xs align-right">
		<span class="flex gap-1">
			<Distance to={pick.createTime} />
		</span>
	</div>
</div>
