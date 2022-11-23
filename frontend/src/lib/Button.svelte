<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click|preventDefault={() => dispatch('click')} class="rounded-md p-1 hover:bg-gray-100">
	<slot />
</button>
