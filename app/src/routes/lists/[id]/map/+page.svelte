<script lang="ts">
	import { merge, notDeleted } from '$lib';
	import { ws } from '$lib/api';
	import { Map } from '$lib/components';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	const items = derived(ws.items.list, (items) =>
		merge(items, data.items)
			.filter(({ listId }) => listId === data.list.id)
			.filter(notDeleted)
			.filter(({ coordinates }) => !!coordinates && coordinates.length > 0)
			.map(({ text, coordinates }) => ({
				title: text,
				coordinates: coordinates as [number, number]
			}))
	);
</script>

<Map items={$items} />
