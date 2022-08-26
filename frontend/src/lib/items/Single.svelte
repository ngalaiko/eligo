<script lang="ts">
	import { useItem } from '$lib/items';

	export let itemId: string;
	const item = useItem(itemId);
</script>

{#if $item.isLoading === false}
	<b>{$item.text}</b>
{/if}
