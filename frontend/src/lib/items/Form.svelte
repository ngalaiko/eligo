<script lang="ts">
	import { create } from '$lib/items';
	import IconPlus from '$lib/assets/IconPlus.svelte';

	export let listId: string;

	let text: string;

	const onCreateClicked = async () => {
		if (!text) return;
		await create({
			listId,
			text
		});
		text = '';
	};
</script>

<form on:submit|preventDefault={onCreateClicked} class="flex gap-2 border-2 px-2 py-1 rounded-2xl">
	<IconPlus class="opacity-50" />
	<input type="submit" hidden />
	<input
		type="text"
		class="w-full focus:ring-none focus:outline-none"
		name="title"
		bind:value={text}
		placeholder="add item"
	/>
</form>
