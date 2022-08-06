<script lang="ts">
	import { createSyncMap } from '@logux/client';
	import { nanoid } from 'nanoid';
	import { useClient } from '$lib/logux';
	import { List, useLists } from '$lib/lists';

	const client = useClient();
	$: lists = useLists($client);

	let title: string;
	const create = () =>
		createSyncMap($client, List, {
			id: nanoid(),
			title
		}).then(() => (title = ''));
</script>

{#if $client}
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={title} />
		<button>new list</button>
	</form>
	<ul>
		{#each $lists.list as list}
			<li><a href={`/lists/${list.id}`}>{list.title}</a></li>
		{/each}
		{#await lists.loading}
			<li>loading...</li>
		{/await}
	</ul>
{:else}
	connecting...
{/if}
