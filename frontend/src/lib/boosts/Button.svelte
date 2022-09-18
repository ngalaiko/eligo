<script lang="ts">
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

<button on:click|preventDefault={onBoostClick} class="items-center underline">
	<IconArrowBigUpLine />
</button>
