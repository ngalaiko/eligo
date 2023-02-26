<script lang="ts">
	import { merge, notDeleted } from '$lib';
	import { ws } from '$lib/api';
	import { Map } from '$lib/components';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';

	export let data: PageData;

	const picks = derived(ws.picks.list, (picks) =>
		merge(picks, data.picks)
			.filter(({ listId }) => listId === data.list.id)
			.sort((a, b) => b.createTime - a.createTime)
	);

	const items = derived([ws.items.list, picks], ([items, picks]) =>
		merge(items, data.items)
			.filter(({ listId }) => listId === data.list.id)
			.filter(notDeleted)
			.filter(({ coordinates }) => !!coordinates && coordinates.length > 0)
			.map(({ id, text, coordinates }) => ({
				title: text,
				coordinates: coordinates as [number, number],
				count: picks.filter(({ itemId }) => itemId === id).length
			}))
	);
</script>

<Map items={$items} />
