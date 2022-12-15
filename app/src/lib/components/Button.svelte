<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type: 'button' | 'submit' = 'button';
	const dispatch = createEventDispatcher();
</script>

<button {type} on:click={() => dispatch('click')} class="rounded-md p-1 hover:bg-background-2">
	<slot />
</button>
