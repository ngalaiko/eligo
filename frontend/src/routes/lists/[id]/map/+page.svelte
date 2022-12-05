<script lang="ts">
	import { ws } from '$lib/api';
	import { Map } from '$lib/components';
	import { derived } from 'svelte/store';

	import type { PageData } from './$types';
	export let data: PageData;

	const listItems = derived(ws.items.list, (items) =>
		items
			.filter((item) => item.listId === data.listId)
			.filter(({ coordinates }) => !!coordinates)
			.map(({ text, coordinates }) => ({
				title: text,
				coordinates
			}))
	);
</script>

<Map items={$listItems} />
