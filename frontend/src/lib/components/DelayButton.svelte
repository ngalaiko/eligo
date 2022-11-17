<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let delayMs = 500;
	export let disabled = true;

	const updateEvery = delayMs / 100;
	let timeout: ReturnType<typeof setTimeout>;
	let interval: ReturnType<typeof setInterval>;

	$: percentage = 0;

	const reset = () => {
		clearTimeout(timeout);
		clearInterval(interval);
		percentage = 0;
	};

	const dispatch = createEventDispatcher();

	const init = () => {
		timeout = setTimeout(() => {
			dispatch('click');
			reset();
		}, delayMs);
		interval = setInterval(() => percentage++, updateEvery);
	};
</script>

<button
	class="cursor-pointer select-none border-2 px-2 py-1 rounded-2xl bg-gray-300 flex w-1/4"
	class:opacity-50={disabled}
	{disabled}
	on:mousedown|preventDefault={init}
	on:touchstart|preventDefault={init}
	on:mouseup|preventDefault={reset}
	on:touchend|preventDefault={reset}
	style:background="linear-gradient(90deg, var(--color-gray-300) {percentage}%, var(--color-white) {percentage}%)"
>
	<div style:width="{percentage}%" class="bg-500 absolute" />
	<slot />
</button>
