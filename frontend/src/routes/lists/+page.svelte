<script lang="ts">
	import { Button } from '$lib';
	import IconPlus from '$lib/assets/IconPlus.svelte';
	import { Card, create, Form, list } from '$lib/lists';
	import { compareDesc } from 'date-fns';

	let formVisible = false;
	const showForm = () => (formVisible = true);
	const hideForm = () => (formVisible = false);
	const onCreate = (params: { title: string }) => create(params).then(hideForm);
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
		{#each $list
			.filter(({ deleteTime }) => deleteTime === undefined)
			.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			<li class="mr-3">
				<a href="/lists/{list.id}/pick/">
					<Card {list} />
				</a>
			</li>
		{/each}
	</ul>
</figure>
