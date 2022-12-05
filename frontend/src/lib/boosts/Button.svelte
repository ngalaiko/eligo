<script lang="ts">
	import { Button } from '$lib/components';
	import IconArrowBigUpLine from '$lib/assets/IconArrowBigUpLine.svelte';
	import { ws } from '$lib/api';

	export let itemId: string;
	export let listId: string;

	const onBoostClick = () =>
		ws.boosts.create({
			itemId,
			listId
		});
</script>

<Button on:click={onBoostClick}>
	<IconArrowBigUpLine />
</Button>
