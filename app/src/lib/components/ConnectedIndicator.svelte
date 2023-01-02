<script lang="ts">
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';

	export let userId: string;

	const connected = derived(
		ws.users.list,
		(users) => users.find(({ id }) => id === userId)?.online ?? false
	);
</script>

<div title={$connected ? 'online' : 'offline'} class="flex items-center">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="10"
		height="10"
		viewBox="0 0 24 24"
		stroke-width="1"
		stroke="transparent"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
		class:fill-green={$connected}
		class:fill-gray-dim={!$connected}
	>
		<circle cx="12" cy="12" r="11" />
	</svg>
</div>
