<script lang="ts">
	import IconPlus from '$lib/assets/IconPlus.svelte';
	import { create } from '$lib/lists';

	let title: string = '';
	const onCreateClick = async () => {
		if (!title) return;
		await create({ title: title });
		title = '';
	};
</script>

<form on:submit|preventDefault={onCreateClick} class="flex gap-2 border-2 px-2 py-1 rounded-2xl">
	<IconPlus class="opacity-50" />
	<input type="submit" hidden />
	<input
		type="text"
		class="w-full focus:ring-none focus:outline-none"
		name="title"
		bind:value={title}
		placeholder="add list"
	/>
</form>
