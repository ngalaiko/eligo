<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher<{
		close: {};
		create: { title: string };
	}>();

	let value = '';
	let input: HTMLInputElement;
	onMount(() => input.focus());
	const onCreate = () => dispatch('create', { title: value });
	const onClose = () => dispatch('close');
</script>

<form on:submit|preventDefault={onCreate} class="gap-2 border-2 px-2 py-1 rounded-2xl">
	<input
		type="text"
		class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden w-full focus:ring-none focus:outline-none"
		name="title"
		required
		bind:value
		bind:this={input}
		on:blur={onClose}
	/>
</form>
