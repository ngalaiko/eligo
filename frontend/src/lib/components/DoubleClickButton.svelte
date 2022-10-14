<script lang="ts">
	import IconX from '$lib/assets/IconX.svelte';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let clicks = 0;

	const onButtonClicked = () => {
		clicks++;
		if (clicks === 2) dispatch('click');
	};

	const onCancelClicked = () => clicks--;
</script>

<div class="flex items-center " class:font-bold={clicks === 1}>
	<button class="underline" on:click|preventDefault={onButtonClicked}>
		<slot />
	</button>
	{#if clicks === 1}
		<button class="flex items-center" on:click|preventDefault={onCancelClicked}
			><IconX class="w-4 h-4 hover:text-red-900" />
		</button>
	{/if}
</div>
