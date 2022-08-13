<script lang="ts">
	import { useLists, createList } from '$lib/lists';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';

	const client = useClient();
	const lists = useLists();

	let title: string = '';
	const create = async () => {
		if (!title) return;
		if (!$session.user) return;
		await createList(client, { title, userId: $session.user.id }).then(() => (title = ''));
	};
</script>

{#await lists.loading then}
	<h1>lists:</h1>
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={title} />
		<button disabled={!title || !$session.user}>new list</button>
	</form>
	<ul>
		{#each $lists.list as { id, title }}
			<li><a href={`/lists/${id}`}>{title}</a></li>
		{/each}
	</ul>
{/await}
