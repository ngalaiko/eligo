<script lang="ts">
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';

	export let itemId: string;
	const item = derived(ws.items.list, (list) => list.find(({ id }) => id === itemId));
</script>

<span class="whitespace-nowrap overflow-ellipsis overflow-hidden">
	<b>{$item.text}</b>
</span>
