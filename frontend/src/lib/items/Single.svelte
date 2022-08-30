<script lang="ts">
	import { useItem } from '$lib/items';

	export let itemId: string;
	const item = useItem(itemId);
</script>

{#if $item.isLoading === false}
	<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
		<b>{$item.text}</b>
	</span>
{/if}
