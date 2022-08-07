<script lang="ts">
	import { useClient } from '$lib/logux';
	import { useLists, createList } from '$lib/lists';

	const client = useClient();
	$: lists = useLists($client);

	let title: string;
	const create = () => createList($client, { title }).then(() => (title = ''));
</script>

{#if $client}
	<h1>lists:</h1>
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={title} />
		<button>new list</button>
	</form>
	<ul>
		{#each $lists.list as list}
			<li><a href={`/lists/${list.id}`}>{list.title}</a></li>
		{/each}
		{#if $lists.isLoading}
			<li>loading...</li>
		{/if}
	</ul>
{:else}
	connecting...
{/if}
