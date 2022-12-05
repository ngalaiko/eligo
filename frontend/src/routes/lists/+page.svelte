<script lang="ts">
	import { Button } from '$lib';
	import IconPlus from '$lib/assets/IconPlus.svelte';
	import { Card, Form } from '$lib/lists';
	import { compareDesc } from 'date-fns';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';

	let formVisible = false;
	const showForm = () => (formVisible = true);
	const hideForm = () => (formVisible = false);
	const onCreate = (params: { title: string }) => ws.lists.create(params).then(hideForm);

	const lists = derived(ws.lists.list, (lists) =>
		lists
			.filter(({ deleteTime }) => deleteTime === undefined)
			.sort((a, b) => compareDesc(a.createTime, b.createTime))
	);
</script>

<svelte:head>
	<title>lists</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	<figcaption class="flex justify-between items-center">
		<span class="font-semibold text-2xl">Lists</span>
		<Button on:click={showForm}>
			<IconPlus class="w-5 h-5" />
		</Button>
	</figcaption>

	{#if formVisible}
		<Form on:close={hideForm} on:create={({ detail }) => onCreate(detail)} />
	{/if}

	<ul class="overflow-y-scroll flex flex-col gap-2 -mr-3">
		{#each $lists as list}
			<li class="mr-3">
				<a href="/lists/{list.id}/pick/">
					<Card {list} />
				</a>
			</li>
		{/each}
	</ul>
</figure>
