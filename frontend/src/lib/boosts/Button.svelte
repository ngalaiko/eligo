<script lang="ts">
	import { Button } from '$lib';
	import IconArrowBigUpLine from '$lib/assets/IconArrowBigUpLine.svelte';
	import { create } from '$lib/boosts';

	export let itemId: string;
	export let listId: string;

	const onBoostClick = () =>
		create({
			itemId,
			listId
		});
</script>

<Button on:click={onBoostClick}>
	<IconArrowBigUpLine />
</Button>
